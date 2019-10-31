/**
 * Action - Uploader Action & Creater
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint object-property-newline: 0 */

import fs from 'fs';
import path from 'path';
import {walk, Settings} from '@nodelib/fs.walk';
import {notification} from 'antd';

import {getUuid} from '../../utils/helper';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

export function uploadStart(taskIds = []) {
    /**
     * 开始任务
     * 如果为空，顺序开始等待任务， 不为空，开始指定任务
     */
    return {
        [UploadCommandType]: {
            command: UploadNotify.Boot, taskIds
        }
    };
}

export function uploadRemove(taskIds = []) {
    /**
     * 删除任务
     * 如果为空，顺序开始等待任务， 不为空，开始指定任务
     */
    return {
        [UploadCommandType]: {
            command: UploadNotify.Remove, taskIds
        }
    };
}

export function uploadSuspend(taskIds = []) {
    /**
     * 暂停任务
     * 如果为空，顺序开始等待任务， 不为空，开始指定任务
     */
    return {
        [UploadCommandType]: {
            command: UploadNotify.Pausing, taskIds
        }
    };
}

function _invokeFile(file, options = {}, dispatch) {
    const uuid = getUuid();
    const baseDir = path.dirname(file.path);
    const {bucketName, prefix = ''} = options;

    dispatch({
        uuid,
        type: UploadNotify.New,
        baseDir,
        bucketName,
        name: file.name,
        totalSize: file.size,
        prefix,
        keymap: {
            [file.path]: {size: file.size, finish: false}
        }
    });

    // 立即开始这个任务
    dispatch(uploadStart([uuid]));
}

function _invokeFolder(relativePath, options = {}, dispatch) {
    const uuid = getUuid();
    const {bucketName, prefix = '', totalSize, keymap} = options;

    // 建立一个新任务
    const folderName = path.basename(relativePath);
    const baseDir = path.dirname(relativePath);

    dispatch({
        uuid,
        type: UploadNotify.New,
        name: folderName,
        baseDir,
        bucketName,
        totalSize,
        prefix,
        keymap
    });

    // 立即开始这个任务
    dispatch(uploadStart([uuid]));
}

function _invokeFileAfterWalk(path, bucket, prefix, dispatch) {
    const keymap = {};
    let totalSize = 0;

    walk(
        path,
        new Settings({stats: true}),
        (err, entries) => {
            if (err) {
                return notification.error({
                    message: `上传 ${name} 错误`,
                    description: err.message
                });
            }

            entries.forEach(file => {
                //  只上传文件就够了
                if (!file.dirent.isDirectory()) {
                    keymap[file.path] = {size: file.stats.size, finish: false};
                    totalSize += file.stats.size;
                }
            });

            _invokeFolder(
                path,
                {bucketName: bucket, prefix, totalSize, keymap},
                dispatch
            );
        }
    );
}

export function uploadByDropFile(dataTransferItem = [], {bucket, prefix}) {
    return dispatch => {
        // 支持拖拽多个文件，包括文件、文件夹
        for (let index = 0; index < dataTransferItem.length; index += 1) {
            const item = dataTransferItem[index];
            const entry = item.webkitGetAsEntry();

            if (entry.isFile) {
                entry.file(file => _invokeFile(
                    file, {bucketName: bucket, prefix}, dispatch // eslint-disable-line no-loop-func
                ));
            } else {
                const _fileRelativePath = item.getAsFile().path;
                _invokeFileAfterWalk(_fileRelativePath, bucket, prefix, dispatch);
                // end walk
            }
        }
    };
}

export function uploadBySelectPaths(selectedPaths = [], {bucket, prefix}) {
    return dispatch => {
        selectedPaths.forEach(targetPath => {
            const name = path.basename(targetPath);
            const stat = fs.statSync(targetPath);
            const isDirectory = stat.isDirectory();

            if (isDirectory) {
                _invokeFileAfterWalk(targetPath, bucket, prefix, dispatch);
            }
            else {
                _invokeFile(
                    {name, path: targetPath, size: stat.size},
                    {bucketName: bucket, prefix},
                    dispatch
                );
            }
        });
    };
}
