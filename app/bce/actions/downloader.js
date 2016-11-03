/**
 * Action - Downloader Action & Creater
 *
 * @file downloader.js
 * @author mudio(job.mudio@gmail.com)
 */

import {getRegionClient} from '../api/client';
import {
    DOWNLOAD_TYPE,
    DOWNLOAD_COMMAND_START,
    DOWNLOAD_COMMAND_CANCEL,
    DOWNLOAD_COMMAND_SUSPEND
} from '../middleware/downloader';
import getUuid from '../utils/Uuid';

export const TRANS_DOWNLOAD_REMOVE = 'TRANS_DOWNLOAD_REMOVE';
export const TRANS_DOWNLOAD_FINISH = 'TRANS_DOWNLOAD_FINISH';
export const TRANS_DOWNLOAD_PROGRESS = 'TRANS_DOWNLOAD_PROGRESS';
export const TRANS_DOWNLOAD_NEW = 'TRANS_DOWNLOAD_NEW';
export const TRANS_DOWNLOAD_ERROR = 'TRANS_DOWNLOAD_ERROR';

export function downloadStart(uuids = []) {
    return {
        [DOWNLOAD_TYPE]: {
            command: DOWNLOAD_COMMAND_START,    // 开始任务
            uuids                               // 如果为空，顺序开始等待任务， 不为空，开始指定任务
        }
    };
}

export function downloadSuspend(uuids = []) {
    return {
        [DOWNLOAD_TYPE]: {
            command: DOWNLOAD_COMMAND_SUSPEND,  // 暂停任务
            uuids                               // 如果为空，全部挂起， 不为空，挂起指定任务
        }
    };
}

export function downloadCancel(uuids = []) {
    return {
        [DOWNLOAD_TYPE]: {
            command: DOWNLOAD_COMMAND_CANCEL,   // 取消任务
            uuids                               // 不为空，取消指定任务
        }
    };
}

export function createDownloadTask(key, path) {
    return (dispatch, getState) => {
        const {auth, navigator} = getState();
        const {region, bucket, folder} = navigator;
        const client = getRegionClient(region, auth);

        client.listAllObjects(bucket, key).then(
            contents => {
                const uuids = contents.map(item => {
                    // 创建任务uuid
                    const uuid = getUuid();
                    const localDir = `${path}/${item.key.replace(folder, '')}`;
                    const extra = {region, bucket, object: item.key, path: localDir};

                    // 这里用object替换key，免得与React.Component.key冲突
                    delete item.key; // eslint-disable-line no-param-reassign

                    dispatch({
                        type: TRANS_DOWNLOAD_NEW,
                        item: Object.assign(extra, item, {uuid})
                    });

                    return uuid;
                });

                dispatch(downloadStart(uuids));
            },
            response => dispatch({
                type: TRANS_DOWNLOAD_ERROR,
                error: response.body
            })
        );
    };
}
