/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { allow: ["_credentials", "_store"] }] */

import fs from 'fs';
import mkdirp from 'mkdirp';
import P from 'path';
import debug from 'debug';
import async from 'async';
import {getRegionClient} from '../api/client';
import {TRANS_WATING} from '../utils/TransferStatus';

export const DOWNLOAD_TYPE = Symbol('Download File');
export const DOWNLOAD_TASK_LIMIT = 5; // 最多跑五个任务
export const DOWNLOAD_PART_SIZE = 5 * 1024 * 1024; // 5MB

export const DOWNLOAD_COMMAND_START = 'TRANS_DOWNLOAD_START'; // 开始任务
export const DOWNLOAD_COMMAND_CANCEL = 'TRANS_DOWNLOAD_CANCEL'; // 取消任务
export const DOWNLOAD_COMMAND_SUSPEND = 'TRANS_DOWNLOAD_SUSPEND'; // 挂起任务
export const DOWNLOAD_NOTIFY_PROGRESS = 'TRANS_DOWNLOAD_PROGRESS'; // 任务进度通知
export const DOWNLOAD_NOTIFY_FINISH = 'DOWNLOAD_NOTIFY_FINISH'; // 任务完成了
export const DOWNLOAD_NOTIFY_ERROR = 'DOWNLOAD_NOTIFY_ERROR'; // 任务完成了

const _credentials = {};
const logger = debug('bce-client:download');
let _store = null;

const queue = async.queue(
    (task, callback) => fetchFileFromServer(task, callback),
    DOWNLOAD_TASK_LIMIT
);

function startTask(downloadTasks = [], uuids = []) {
    let waitTasks = [];
    const leftWorker = DOWNLOAD_TASK_LIMIT - queue.running();

    if (uuids.length === 0) {
        // 从剩余任务中选取等待下载的任务并开始
        waitTasks = downloadTasks.filter(
            task => task.status === TRANS_WATING
        ).slice(0, leftWorker);
    } else {
        // 从剩余任务中选取指定uuid等待下载的任务并开始
        waitTasks = downloadTasks.filter(
            task => task.status === TRANS_WATING && uuids.indexOf(task.uuid) > -1
        ).slice(0, leftWorker);
    }

    // 这里默认不会有重复的待添加任务
    const queueUuids = queue.workersList().map(item => item.data.uuid);
    waitTasks.forEach(task => {
        if (queueUuids.indexOf(task.uuid) > -1) {
            // 任务去重
            logger('Ignore duplicate task, uuid = %s', task.uuid);
            return;
        }

        queue.push(task, err => {
            if (err) {
                return _store.dispatch({
                    uuid: task.uuid,
                    error: err.message,
                    type: DOWNLOAD_NOTIFY_ERROR
                });
            }
            _store.dispatch({type: DOWNLOAD_NOTIFY_FINISH, uuid: task.uuid});
            // 一个任务完成了，无论是因为出错还是下载完成，都会开始下个等待任务
            _store.dispatch({
                [DOWNLOAD_TYPE]: {
                    uuids: [],
                    command: DOWNLOAD_COMMAND_START
                }
            });
        });
    });
}

function cancelTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function suspendTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function fetchFileFromServer(task, done) {
    let timer = null;
    const {uuid, region, bucket, object, path} = task;
    const dirName = P.dirname(path);
    const client = getRegionClient(region, _credentials);

    if (!fs.existsSync(dirName)) {
        try {
            mkdirp.sync(dirName, 0o700);
        } catch (e) {
            return done(e);
        }
    } else if (!fs.lstatSync(dirName).isDirectory()) {
        // 操作系统不支持文件夹与文件名相同，先抛出错误
        return done(new Error('创建路径错误'));
    }

    process.noAsar = true;
    const outputStream = fs.createWriteStream(path);
    process.noAsar = false;

    outputStream.once('pipe', reader => {
        let loaded = 0;
        timer = setInterval(
            () => {
                const increaseSize = loaded;
                loaded = 0;
                _store.dispatch({uuid, increaseSize, type: DOWNLOAD_NOTIFY_PROGRESS});
            },
            1e3
        );

        reader.on('data', chunk => {
            loaded += chunk.length;
        });

        reader.socket.setTimeout(5e3,
            () => reader.destroy(new Error('传输超时'))
        );
    });

    logger('Start uuid = %s, bucket = %s, key = %s', uuid, bucket, object);
    client.sendRequest('GET', {
        key: object,
        outputStream,
        bucketName: bucket,
        headers: {Range: ''}
    })
    .then(
        () => {
            clearInterval(timer);
            logger('Finish uuid = %s, bucket = %s, key = %s', uuid, bucket, object);
            done();
        },
        ex => {
            clearInterval(timer);
            logger('Finish uuid = %s, bucket = %s, key = %s, error = %s', uuid, bucket, object, ex);
            done(ex);
        }
    );
}

export function download(store) {
    return next => action => {
        const downloadTask = action[DOWNLOAD_TYPE];

        if (typeof downloadTask === 'undefined') {
            return next(action);
        }

        const {command, uuids} = downloadTask;
        const {downloads, auth} = store.getState();

        _credentials.ak = auth.ak;
        _credentials.sk = auth.sk;
        _store = store;

        next({type: command, uuids});

        switch (command) {
        case DOWNLOAD_COMMAND_START:
            return startTask(downloads, uuids);
        case DOWNLOAD_COMMAND_CANCEL:
            return cancelTask(downloads, uuids);
        case DOWNLOAD_COMMAND_SUSPEND:
            return suspendTask(downloads, uuids);
        default:
            throw new Error(`Not Expected Command: ${command}`);
        }
    };
}
