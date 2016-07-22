/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import async from 'async';
import {TRANS_WATING} from '../utils/TransferStatus';
import {getRegionClient} from '../api/client';

export const DOWNLOAD_TYPE = Symbol('Upload File');
export const DOWNLOAD_TASK_LIMIT = 5; // 最多跑五个任务
export const DOWNLOAD_RATE_LIMIT = 200; // kb/s 暂不支持
export const DOWNLOAD_PART_SIZE = 5 * 1024 * 1024; // 5MB

export const DOWNLOAD_COMMAND_START = 'TRANS_DOWNLOAD_START'; // 开始任务
export const DOWNLOAD_COMMAND_CANCEL = 'TRANS_DOWNLOAD_CANCEL'; // 取消任务
export const DOWNLOAD_COMMAND_SUSPEND = 'TRANS_DOWNLOAD_SUSPEND'; // 挂起任务
export const DOWNLOAD_NOTIFY_PROGRESS = 'TRANS_DOWNLOAD_PROGRESS'; // 任务进度通知
export const DOWNLOAD_NOTIFY_FINISH = 'DOWNLOAD_NOTIFY_FINISH'; // 任务完成了

const credentials = {};
let eventEmiter = noop => noop;

const queue = async.queue(
    (task, callback) => uploadFromFile(task, callback),
    DOWNLOAD_TASK_LIMIT
);

function startTask(uploadTasks = [], uploadIds = []) {
    if (uploadIds.length === 0) {
        const leftWorker = DOWNLOAD_TASK_LIMIT - queue.running();
        const waitTasks = uploadTasks.filter(task => task.status === TRANS_WATING);

        waitTasks.slice(0, leftWorker).forEach(
            task => queue.push(
                task,
                () => eventEmiter({type: DOWNLOAD_NOTIFY_FINISH, uploadId: task.uploadId})
            )
        );
    } else {
        const waitTasks = uploadTasks.filter(
            task => task.status === TRANS_WATING && uploadIds.indexOf(task.uploadId) > -1
        );

        waitTasks.forEach(
            task => queue.push(
                task,
                () => eventEmiter({type: DOWNLOAD_NOTIFY_FINISH, uploadId: task.uploadId})
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

export function upload(store) {
    return next => action => {
        const downloadTask = action[DOWNLOAD_TYPE];

        if (typeof downloadTask === 'undefined') {
            return next(action);
        }

        const {command, uploadIds} = downloadTask;
        const {uploads, auth} = store.getState();

        credentials.ak = auth.ak;
        credentials.sk = auth.sk;
        eventEmiter = message => next(message);

        next({type: command, uploadIds});

        switch (command) {
        case DOWNLOAD_COMMAND_START:
            return startTask(uploads, uploadIds);
        case DOWNLOAD_COMMAND_CANCEL:
            return cancelTask(uploads, uploadIds);
        case DOWNLOAD_COMMAND_SUSPEND:
            return suspendTask(uploads, uploadIds);
        default:
            throw new Error(`Not Expected Command: ${command}`);
        }
    };
}
