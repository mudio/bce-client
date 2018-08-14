/**
 * Action - Downloader Action & Creater
 *
 * @file downloader.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable object-property-newline */

import {notification} from 'antd';

import {getUuid} from '../../utils/helper';
import {ClientFactory} from '../api/client';
import {DownloadNotify, DownloadCommandType} from '../utils/TransferNotify';

export function downloadStart(taskIds = []) {
    /**
     * 开始任务
     * 如果为空，顺序开始等待任务， 不为空，开始指定任务
     */
    return {
        [DownloadCommandType]: {
            command: DownloadNotify.Boot, taskIds
        }
    };
}

export function downloadRemove(taskIds = []) {
    /**
     * 删除任务
     * 如果为空，顺序开始等待任务， 不为空，开始指定任务
     */
    return {
        [DownloadCommandType]: {
            command: DownloadNotify.Remove, taskIds
        }
    };
}

export function downloadSuspend(taskIds = []) {
    /**
     * 暂停任务
     */
    return {
        [DownloadCommandType]: {
            command: DownloadNotify.Pausing, taskIds
        }
    };
}

export function createDownloadTask(bucketName, prefix, objectKeys, baseDir) {
    return async dispatch => {
        const client = await ClientFactory.fromBucket(bucketName);

        objectKeys.forEach(async objectKey => {
            let totalSize = 0;
            const uuid = getUuid();
            const isFolder = objectKey.endsWith('/');

            try {
                const contents = await client.listAllObjects(bucketName, objectKey);
                const keymap = contents.reduce((context, item) => {
                    /**
                     * 如果不是目录，前缀匹配可能不准确
                     */
                    if (!isFolder && item.key === objectKey) {
                        context[item.key] = {finish: false, size: item.size}; // eslint-disable-line
                        totalSize += item.size;
                    }

                    /**
                     * 忽略目录形式的object
                     */
                    if (isFolder && !item.key.endsWith('/')) {
                        context[item.key] = {finish: false, size: item.size}; // eslint-disable-line
                        totalSize += item.size;
                    }

                    return context;
                }, {});

                // 建立新任务
                dispatch({
                    type: DownloadNotify.New,
                    uuid, bucketName, prefix,
                    baseDir, objectKey,
                    totalSize, keymap
                });

                dispatch(downloadStart([uuid]));
            } catch (ex) {
                notification.error({
                    message: '下载失败',
                    description: `下载错误：${ex.message}`
                });
            }
        });
    };
}
