/**
 * Action - Downloader Action & Creater
 *
 * @file downloader.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
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

export function createDownloadTask(region, bucketName, prefix, objectKeys, baseDir) {
    return dispatch => {
        const client = ClientFactory.fromRegion(region);

        objectKeys.forEach(objectKey => {
            const uuid = getUuid();
            const isFolder = objectKey.endsWith('/');

            client.listAllObjects(bucketName, objectKey).then(
                contents => {
                    let totalSize = 0;

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
                        uuid,
                        region,
                        bucketName,
                        prefix,
                        baseDir,
                        objectKey,
                        totalSize,
                        keymap
                    });

                    const name = path.posix.relative(prefix, objectKey).split('/')[0];
                    notification.success({
                        message: '开始下载',
                        description: `准备下载 ${name}，共计 ${Object.keys(keymap).length} 个文件`
                    });

                    dispatch(downloadStart([uuid]));
                },
                response => notification.error({
                    message: '下载失败',
                    description: `下载错误：${response.body}`
                })
            );
        });
    };
}
