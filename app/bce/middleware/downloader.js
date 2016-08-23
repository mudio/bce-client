/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import fs from 'fs';
import P from 'path';
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

const credentials = {};
let eventEmiter = noop => noop;

const queue = async.queue(
    (task, callback) => fetchFileFromServer(task, callback),
    DOWNLOAD_TASK_LIMIT
);

function startTask(downloadTasks = [], downloadKeys = []) {
    let waitTasks = [];

    if (downloadKeys.length === 0) {
        const leftWorker = DOWNLOAD_TASK_LIMIT - queue.running();
        waitTasks = downloadTasks.filter(
            task => task.status === TRANS_WATING
        ).slice(0, leftWorker);
    } else {
        waitTasks = downloadTasks.filter(
            task => task.status === TRANS_WATING
        );
    }

    waitTasks.forEach(
        task => queue.push(task, err => {
            if (err) {
                return eventEmiter({
                    path: task.path,
                    error: err.message,
                    type: DOWNLOAD_NOTIFY_ERROR
                });
            }
            eventEmiter({type: DOWNLOAD_NOTIFY_FINISH, path: task.path});
        })
    );
}

function cancelTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function suspendTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function fetchFileFromServer(task, done) {
    let timer = null;
    const {bucket, key, region, path} = task;
    const pathInfo = P.parse(path);
    const client = getRegionClient(region, credentials);

    if (!fs.existsSync(pathInfo.dir)) {
        const dir = pathInfo.dir.substr(pathInfo.root.length);
        const dirParts = dir.split(P.sep);
        for (let index = 0; index < dirParts.length; index++) {
            const relativeDir = dirParts.slice(0, index + 1).join(P.sep);
            const absoluteDir = pathInfo.root + relativeDir;
            if (!fs.existsSync(absoluteDir)) {
                fs.mkdirSync(absoluteDir);
            }
        }
    } else if (!fs.lstatSync(pathInfo.dir).isDirectory()) {
        // 操作系统不支持文件夹与文件名相同，先抛出错误
        return done(new Error('创建路径错误'));
    }

    const outputStream = fs.createWriteStream(path);
    outputStream.once('pipe', reader => {
        let loaded = 0;
        timer = setInterval(
            () => eventEmiter({path, loaded, type: DOWNLOAD_NOTIFY_PROGRESS}),
            1e3
        );

        reader.on('data', chunk => {
            loaded += chunk.length;
        });

        reader.socket.setTimeout(5e3,
            () => reader.destroy(new Error('传输超时'))
        );
    });

    client.sendRequest('GET', {
        key,
        outputStream,
        bucketName: bucket,
        headers: {Range: ''}
    })
    .then(() => done(), done)
    .finally(() => clearInterval(timer));
}

export function download(store) {
    return next => action => {
        const downloadTask = action[DOWNLOAD_TYPE];

        if (typeof downloadTask === 'undefined') {
            return next(action);
        }

        const {command, keys} = downloadTask;
        const {downloads, auth} = store.getState();

        credentials.ak = auth.ak;
        credentials.sk = auth.sk;
        eventEmiter = message => next(message);

        next({type: command, keys});

        switch (command) {
        case DOWNLOAD_COMMAND_START:
            return startTask(downloads, keys);
        case DOWNLOAD_COMMAND_CANCEL:
            return cancelTask(downloads, keys);
        case DOWNLOAD_COMMAND_SUSPEND:
            return suspendTask(downloads, keys);
        default:
            throw new Error(`Not Expected Command: ${command}`);
        }
    };
}
