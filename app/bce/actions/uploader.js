/**
 * Action - Uploader Action & Creater
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import {
    UPLOAD_TYPE,
    UPLOAD_COMMAND_START,
    UPLOAD_COMMAND_CANCEL,
    UPLOAD_COMMAND_SUSPEND
} from '../middleware/uploader';

export const TRANS_UPLOAD_REMOVE = 'TRANS_UPLOAD_REMOVE';
export const TRANS_UPLOAD_FINISH = 'TRANS_UPLOAD_FINISH';
export const TRANS_UPLOAD_PROGRESS = 'TRANS_UPLOAD_PROGRESS';
export const TRANS_UPLOAD_NEW = 'TRANS_UPLOAD_NEW';
export const TRANS_UPLOAD_ERROR = 'TRANS_UPLOAD_ERROR';
export const TRANS_UPLOAD_PREPARE = 'TRANS_UPLOAD_PREPARE';

export function uploadStart(objects = []) {
    return {
        [UPLOAD_TYPE]: {
            command: UPLOAD_COMMAND_START,  // 开始任务
            objects                       // 如果为空，顺序开始等待任务， 不为空，开始指定任务
        }
    };
}

export function uploadSuspend(objects = []) {
    return {
        [UPLOAD_TYPE]: {
            command: UPLOAD_COMMAND_SUSPEND,  // 暂停任务
            objects                       // 如果为空，全部挂起， 不为空，挂起指定任务
        }
    };
}

export function uploadCancel(objects = []) {
    return {
        [UPLOAD_TYPE]: {
            command: UPLOAD_COMMAND_CANCEL,  // 取消任务
            objects                       // 不为空，取消指定任务
        }
    };
}

export function prepareUploadTask(filePath, fileSize, region, bucket, object) {
    return dispatch => {
        // 新建一个上传任务
        dispatch({type: TRANS_UPLOAD_NEW, region, bucket, object, filePath, fileSize});
        // 立即开始这个任务，如果排队则自动等待
        dispatch(uploadStart([object]));
    };
}

export function createUploadTask(dataTransferItem = [], region, bucket, key) {
    return dispatch => {
        // 参考：https://dev.w3.org/2009/dap/file-system/file-dir-sys.html
        function getAllEntries(directoryReader, callback) {
            let allEntries = [];

            function readEntries() {
                directoryReader.readEntries(entries => {
                    if (entries.length === 0) {
                        callback(allEntries);
                    } else {
                        const iterator = Array.prototype.slice.call(entries, 0);
                        allEntries = allEntries.concat(iterator);
                        readEntries();
                    }
                });
            }

            readEntries();
        }

        // 文件准备上传，文件夹递归遍历
        function entryHandle(entry, relativePath = '') {
            if (entry.isFile) {
                entry.file(
                    file => dispatch(
                        prepareUploadTask(file.path, file.size, region, bucket, relativePath + file.name)
                    )
                );
            } else if (entry.isDirectory) {
                getAllEntries(
                    entry.createReader(),
                    entries => entries.forEach(item => entryHandle(item, `${relativePath}${entry.name}/`))
                );
            }
        }

        // 支持拖拽多个文件，包括文件、文件夹
        for (let index = 0; index < dataTransferItem.length; index++) { // eslint-disable-line no-plusplus
            const item = dataTransferItem[index];
            const entry = item.webkitGetAsEntry();
            entryHandle(entry, key);
        }
    };
}
