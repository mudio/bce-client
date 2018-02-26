/**
 * Action - Uploader Action & Creater
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint object-property-newline: 0 */

import fs from 'fs';
import path from 'path';
import walk from 'fs-walk';
import {notification} from 'antd';

import {humanSize} from '../../utils';
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

    notification.success({
        message: `上传 ${file.name}`,
        description: `共计大小 ${humanSize(file.size)}。`
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

    const keys = Object.keys(keymap);
    notification.success({
        message: `上传 ${folderName}`,
        description: `共计 ${keys.length} 个文件, 文件大小 ${humanSize(totalSize)}`
    });

    // 立即开始这个任务
    dispatch(uploadStart([uuid]));
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
                const keymap = {};
                let totalSize = 0;
                const _fileRelativePath = item.getAsFile().path;

                walk.files(
                    _fileRelativePath,
                    (basedir, filename, stat, next) => { // eslint-disable-line no-loop-func
                        const _localPath = path.join(basedir, filename);

                        keymap[_localPath] = {size: stat.size, finish: false};
                        totalSize += stat.size;

                        next();
                    },
                    err => { // eslint-disable-line no-loop-func
                        if (err) {
                            return notification.error({
                                message: `上传 ${entry.name} 错误`,
                                description: err.message
                            });
                        }

                        _invokeFolder(
                            _fileRelativePath,
                            {bucketName: bucket, prefix, totalSize, keymap},
                            dispatch
                        );
                    }
                );
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
                let totalSize = 0;
                const keymap = {};

                walk.files(
                    targetPath,
                    (basedir, filename, {size}, next) => { // eslint-disable-line no-loop-func
                        const _localPath = path.join(basedir, filename);

                        keymap[_localPath] = {size, finish: false};
                        totalSize += size;

                        next();
                    },
                    err => { // eslint-disable-line no-loop-func
                        if (err) {
                            return notification.error({
                                message: `上传 ${name} 错误`,
                                description: err.message
                            });
                        }

                        _invokeFolder(
                            targetPath,
                            {bucketName: bucket, prefix, totalSize, keymap},
                            dispatch
                        );
                    }
                );
                return;
            }

            _invokeFile(
                {name, path: targetPath, size: stat.size},
                {bucketName: bucket, prefix},
                dispatch
            );
        });
    };
}
