/**
 * Action - Uploader Action & Creater
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint object-property-newline: 0 */

import path from 'path';
import walk from 'fs-walk';

import {getUuid} from '../utils/utils';
import {error} from '../utils/logger';
import {TransType} from '../utils/BosType';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

export function uploadStart(taskIds = []) {
    return {
        [UploadCommandType]: {
            command: UploadNotify.Start,    // 开始任务
            taskIds                         // 如果为空，顺序开始等待任务， 不为空，开始指定任务
        }
    };
}

export function uploadRemove(taskIds = []) {
    return {
        [UploadCommandType]: {
            command: UploadNotify.Remove,    // 删除任务
            taskIds                          // 如果为空，顺序开始等待任务， 不为空，开始指定任务
        }
    };
}

export function uploadSuspend(taskIds = []) {
    return {
        [UploadCommandType]: {
            command: UploadNotify.Suspending,   // 暂停任务
            taskIds                             // 如果为空，顺序开始等待任务， 不为空，开始指定任务
        }
    };
}

export function createUploadTask(dataTransferItem = [], region, bucket, prefix) {
    return dispatch => {
        // 支持拖拽多个文件，包括文件、文件夹
        for (let index = 0; index < dataTransferItem.length; index += 1) {
            const item = dataTransferItem[index];
            const entry = item.webkitGetAsEntry();
            // 创建一个uuid来标识任务
            const uuid = getUuid();

            if (entry.isFile) {
                entry.file(file => {
                    // 准备任务
                    dispatch({
                        uuid,
                        name: file.name,
                        basedir: file.path,
                        type: UploadNotify.Prepare,
                        category: TransType.File,
                        region, bucket, prefix
                    });

                    // 存储文件信息
                    const key = getUuid();
                    localStorage.setItem(key, JSON.stringify({
                        path: file.path,
                        relative: file.name,
                        totalSize: file.size
                    }));

                    // 建立keymap
                    const keymapId = getUuid();
                    localStorage.setItem(keymapId, JSON.stringify({
                        errorQueue: [],
                        completeQueue: [],
                        waitingQueue: [key]
                    }));

                    // 建立一个新任务
                    dispatch({
                        type: UploadNotify.New, uuid, totalSize: file.size,
                        keymap: {key: keymapId, waiting: 1, error: 0, complete: 0}
                    });

                    // 立即开始这个任务
                    dispatch(uploadStart([uuid]));
                });
            } else {
                const keys = [];
                let totalSize = 0;
                const filePath = item.getAsFile().path;
                // 准备任务
                dispatch({
                    uuid,
                    name: entry.name,
                    basedir: filePath,
                    type: UploadNotify.Prepare,
                    category: TransType.Directory,
                    region, bucket, prefix, totalSize
                });

                walk.files(filePath, (basedir, filename, stat, next) => {
                    const key = getUuid();
                    const absolutePath = path.join(basedir, filename);
                    const relativePath = absolutePath.replace(filePath, entry.fullPath);

                    // 存储任务
                    localStorage.setItem(key, JSON.stringify({
                        relative: relativePath,
                        path: absolutePath,
                        totalSize: stat.size
                    }));

                    keys.push(key);
                    totalSize += stat.size;

                    next();
                }, err => {
                    if (err) {
                        error('walk %s error = %s', entry.name, err.message);
                        dispatch({type: UploadNotify.Remove, uuid});
                        return;
                    }

                    // 建立keymap
                    const keymapId = getUuid();
                    localStorage.setItem(keymapId, JSON.stringify({
                        errorQueue: [],
                        completeQueue: [],
                        waitingQueue: keys
                    }));

                    // 建立一个新任务
                    dispatch({
                        type: UploadNotify.New, uuid, totalSize,
                        keymap: {key: keymapId, waiting: keys.length, error: 0, complete: 0}
                    });

                    // 立即开始这个任务
                    dispatch(uploadStart([uuid]));
                });
                // end walk
            }
        }
    };
}
