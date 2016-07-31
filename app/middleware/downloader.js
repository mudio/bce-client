/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import fs from 'fs';
import {dirname} from 'path';
import async from 'async';
import {TRANS_WATING} from '../utils/TransferStatus';
import {getRegionClient} from '../api/client';

export const DOWNLOAD_TYPE = Symbol('Download File');
export const DOWNLOAD_TASK_LIMIT = 5; // 最多跑五个任务
export const DOWNLOAD_PART_SIZE = 5 * 1024 * 1024; // 5MB

export const DOWNLOAD_COMMAND_START = 'TRANS_DOWNLOAD_START'; // 开始任务
export const DOWNLOAD_COMMAND_CANCEL = 'TRANS_DOWNLOAD_CANCEL'; // 取消任务
export const DOWNLOAD_COMMAND_SUSPEND = 'TRANS_DOWNLOAD_SUSPEND'; // 挂起任务
export const DOWNLOAD_NOTIFY_PROGRESS = 'TRANS_DOWNLOAD_PROGRESS'; // 任务进度通知
export const DOWNLOAD_NOTIFY_FINISH = 'DOWNLOAD_NOTIFY_FINISH'; // 任务完成了

const credentials = {};
let eventEmiter = noop => noop;

const queue = async.queue(
    (task, callback) => fetchFileFromServer(task, callback),
    DOWNLOAD_TASK_LIMIT
);

function startTask(downloadTasks = [], downloadKeys = []) {
    if (downloadKeys.length === 0) {
        const leftWorker = DOWNLOAD_TASK_LIMIT - queue.running();
        const waitTasks = downloadTasks.filter(task => task.status === TRANS_WATING);

        waitTasks.slice(0, leftWorker).forEach(
            task => queue.push(
                task,
                () => eventEmiter({type: DOWNLOAD_NOTIFY_FINISH, path: task.path})
            )
        );
    } else {
        const waitTasks = downloadTasks.filter(
            task => task.status === TRANS_WATING
        );

        waitTasks.forEach(
            task => queue.push(
                task,
                () => eventEmiter({type: DOWNLOAD_NOTIFY_FINISH, path: task.path})
            )
        );
    }
}

function cancelTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function suspendTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function fetchFileFromServer(task, done) {
    const {bucket, key, region, path} = task;
    const client = getRegionClient(region, credentials);

    if (!fs.existsSync(dirname(path))) {
        fs.mkdirSync(dirname(path));
    }

    const outputStream = fs.createWriteStream(path);
    outputStream.once('pipe', reader => {
        let loaded = 0;
        const timer = setInterval(
            () => eventEmiter({path, loaded, type: DOWNLOAD_NOTIFY_PROGRESS}),
            1e3
        );

        reader.on('data', chunk => {
            loaded += chunk.length;
        });
        reader.on('end', () => clearInterval(timer));
    });

    client.sendRequest('GET', {
        key,
        outputStream,
        bucketName: bucket,
        headers: {Range: ''}
    }).then(done, err => done(err));
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
