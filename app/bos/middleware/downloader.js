/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import {notification} from 'antd';

import {warn} from '../../utils/logger';
import {downloadProcesser} from './bootstrap';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify, DownloadCommandType} from '../utils/TransferNotify';

function initTask(taskIds = []) {
    window.globalStore.getState().downloads.forEach(item => {
        if (taskIds.length > 0 && !taskIds.includes(item.uuid)) {
            return;
        }

        if (item.status !== DownloadStatus.Paused) {
            return;
        }

        const {uuid, bucketName, baseDir, totalSize, prefix, keymap} = item;
        const task = Object.entries(keymap).find(entry => !entry[1].finish);

        if (task) {
            const objectKey = task[0];
            const relativePath = path.posix.relative(prefix, objectKey);
            const localPath = path.join(baseDir, relativePath);

            downloadProcesser.add({
                uuid, bucketName, localPath, objectKey, totalSize
            });
        }
    });
}

function finishTask({uuid, objectKey}) {
    const tasks = window.globalStore.getState().downloads;

    for (let index = 0; index < tasks.length; index += 1) {
        const item = tasks[index];

        if (item.uuid === uuid && objectKey in item.keymap) {
            /**
             * 找出未完成的object
             */
            const unFinishKeys = Object.entries(item.keymap).reduce(
                (context, cur) => {
                    const [key, data] = cur;

                    if (!data.finish) {
                        context.push(key);
                    }

                    return context;
                },
                []
            );

            if (unFinishKeys.includes(objectKey)) {
                // 如果剩余多个子任务，则开始下一个子任务，否则完成任务
                if (unFinishKeys.length > 1) {
                    window.globalStore.dispatch(
                        {type: DownloadNotify.FinishPart, uuid, objectKey}
                    );

                    return initTask([uuid]);
                }

                const name = path.posix.relative(item.prefix, objectKey).split('/')[0];
                notification.success({
                    message: '下载完成',
                    description: `成功下载 ${name}`
                });

                return window.globalStore.dispatch(
                    {type: DownloadNotify.Finish, uuid, objectKey}
                );
            }
        }
    }
}

function pauseTask(taskIds = []) {
    // 暂停全部
    if (taskIds.length === 0) {
        const tasks = window.globalStore.getState().downloads;

        return tasks.forEach(({uuid, status}) => {
            if (status === DownloadStatus.Running) {
                downloadProcesser.pause(uuid);
                window.globalStore.dispatch({type: DownloadNotify.Paused, uuid});
            }
        });
    }

    // 暂停部分
    return taskIds.forEach(uuid => {
        downloadProcesser.pause(uuid);
        window.globalStore.dispatch({type: DownloadNotify.Paused, uuid});
    });
}

function removeTask(taskIds = []) {
    taskIds.forEach(uuid => {
        downloadProcesser.remove(uuid);
        window.globalStore.dispatch({type: DownloadNotify.Remove, uuid});
    });
}

function syncProgress({type, uuid, objectKey, rate, bytesWritten}) {
    const tasks = window.globalStore.getState().downloads;

    for (let index = 0; index < tasks.length; index += 1) {
        const item = tasks[index];

        if (item.uuid === uuid) {
            let offsetSize = bytesWritten;

            if (Object.keys(item.keymap).length > 1) {
                /**
                 * 统计一下已完成任务的大小
                 */
                offsetSize += Object.entries(item.keymap).reduce((statistics, objectItem) => {
                    const [key, objectInfo] = objectItem;

                    if (objectInfo.finish && key !== objectKey) {
                        statistics += objectInfo.size;
                    }

                    return statistics;
                }, 0);
            }

            return window.globalStore.dispatch({type, uuid, rate, offsetSize});
        }
    }
}

export default function download() {
    return next => action => {
        const downloadCommand = action[DownloadCommandType];

        if (typeof downloadCommand === 'undefined') {
            return next(action);
        }

        const {command, uuid} = downloadCommand;

        switch (command) {
        case DownloadNotify.Init:
            return initTask(downloadCommand.taskIds);
        case DownloadNotify.Start:
            return next({type: DownloadNotify.Start, uuid});
        case DownloadNotify.Finish:
            return finishTask(downloadCommand);
        case DownloadNotify.Remove:
            return removeTask(downloadCommand.taskIds);
        case DownloadNotify.Progress:
            return syncProgress(Object.assign({type: DownloadNotify.Progress}, downloadCommand));
        case DownloadNotify.Pausing:
            return pauseTask(downloadCommand.taskIds);
        case DownloadNotify.Paused:
            return next({type: DownloadNotify.Paused, uuid});
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, uuid});
        }
    };
}
