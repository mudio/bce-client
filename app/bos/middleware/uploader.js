/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import {notification} from 'antd';

import {warn} from '../../utils/logger';
import {uploadProcesser} from './bootstrap';
import {UploadStatus} from '../utils/TransferStatus';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

function bootTask(taskIds = []) {
    const tasks = window.globalStore.getState().uploads;

    tasks.forEach(item => {
        if (taskIds.length > 0 && !taskIds.includes(item.uuid)) {
            return;
        }

        if (item.status === UploadStatus.Finish) {
            return;
        }

        // 让任务转为等待状态。
        if (item.status !== UploadStatus.Running
            && item.status !== UploadStatus.Waiting) {
            window.globalStore.dispatch({type: UploadNotify.Waiting, uuid: item.uuid});
        }

        const {uuid, region, bucketName, baseDir, prefix, keymap} = item;
        const task = Object.entries(keymap).find(entry => !entry[1].finish);

        if (task) {
            const [localPath, option] = task;
            const relativePath = path.relative(baseDir, localPath);
            const objectKey = path.posix.join(prefix, ...relativePath.split(path.sep));

            uploadProcesser.add({
                uuid, region, bucketName, objectKey, localPath, uploadId: option.uploadId
            });
        }
    });
}

function finishTask({uuid, localPath}) {
    const tasks = window.globalStore.getState().uploads;

    for (let index = 0; index < tasks.length; index += 1) {
        const item = tasks[index];

        if (item.uuid === uuid && localPath in item.keymap) {
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

            if (unFinishKeys.includes(localPath)) {
                // 如果剩余多个子任务，则开始下一个子任务，否则完成任务
                if (unFinishKeys.length > 1) {
                    window.globalStore.dispatch(
                        {type: UploadNotify.FinishPart, uuid, localPath}
                    );

                    return bootTask([uuid]);
                }

                notification.success({
                    message: '上传完成',
                    description: `成功上传 ${item.name}`
                });

                // 完成任务
                window.globalStore.dispatch(
                    {type: UploadNotify.Finish, uuid, localPath}
                );
            }
        }
    }
}

function pauseTask(taskIds = []) {
    // 暂停全部
    if (taskIds.length === 0) {
        const tasks = window.globalStore.getState().uploads;

        uploadProcesser.kill();

        return tasks.forEach(({uuid, status}) => {
            if (status === UploadStatus.Running || status === UploadStatus.Waiting) {
                window.globalStore.dispatch({type: UploadNotify.Paused, uuid});
            }
        });
    }

    // 暂停部分
    return taskIds.forEach(uuid => {
        uploadProcesser.pause(uuid);
        window.globalStore.dispatch({type: UploadNotify.Paused, uuid});
    });
}

function syncProgress({uuid, rate, bytesWritten}) {
    const tasks = window.globalStore.getState().uploads;

    for (let index = 0; index < tasks.length; index += 1) {
        const item = tasks[index];

        if (item.uuid === uuid) {
            let offsetSize = bytesWritten;

            if (Object.keys(item.keymap).length > 1) {
                /**
                 * 统计一下已完成任务的大小
                 */
                offsetSize += Object.entries(item.keymap).reduce((statistics, objectItem) => {
                    const objectInfo = objectItem[1];

                    if (objectInfo.finish) {
                        statistics += objectInfo.size;
                    }

                    return statistics;
                }, 0);
            }

            return window.globalStore.dispatch({type: UploadNotify.Progress, uuid, rate, offsetSize});
        }
    }
}

function removeTask(taskIds = []) {
    taskIds.forEach(uuid => {
        uploadProcesser.remove(uuid);
        window.globalStore.dispatch({type: UploadNotify.Remove, uuid});
    });
}

export default function upload() {
    return next => action => {
        const uploadCommand = action[UploadCommandType];

        if (typeof uploadCommand === 'undefined') {
            return next(action);
        }

        const {command, taskIds} = uploadCommand;

        switch (command) {
        case UploadNotify.Boot:
            return bootTask(uploadCommand.taskIds);
        case UploadNotify.Start: {
            const {uuid, uploadId, localPath} = uploadCommand;
            return next({type: UploadNotify.Start, uuid, uploadId, localPath});
        }
        case UploadNotify.Finish:
            return finishTask(uploadCommand);
        case UploadNotify.Progress:
            return syncProgress(uploadCommand);
        case UploadNotify.Pausing:
            return pauseTask(uploadCommand.taskIds);
        case UploadNotify.Paused: {
            const {uuid} = uploadCommand;
            return next({type: UploadNotify.Paused, uuid});
        }
        case UploadNotify.Remove:
            return removeTask(uploadCommand.taskIds);
        case UploadNotify.Error: {
            const {uuid, error} = uploadCommand;
            return next({type: UploadNotify.Error, uuid, error});
        }
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, taskIds});
        }
    };
}
