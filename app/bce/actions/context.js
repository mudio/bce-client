/**
 * Action - Selection Action & Creater
 *
 * @file Selection.js
 * @author mudio(job.mudio@gmail.com)
 */

import {remote} from 'electron';

import {createUploadTask} from './uploader';
import {createDownloadTask} from './downloader';
import {listObjects, deleteObject} from './window';

export function refresh(bucketName, prefix) {
    return listObjects(bucketName, prefix);
}

export function uploadFile(...args) {
    return createUploadTask(...args);
}

export const MENU_COPY_COMMAND = Symbol('Copy');
export const MENU_MOVE_COMMAND = Symbol('Move');
export const MENU_VIEW_COMMAND = Symbol('View');
export const MENU_SHARE_COMMAND = Symbol('Share');
export const MENU_RENAME_COMMAND = Symbol('Rename');
export const MENU_DOWNLOAD_COMMAND = Symbol('Download');
export const MENU_TRASH_COMMAND = Symbol('Trash');

export function copy() {

}

export function move() {

}

export function view() {

}

export function share() {

}

export function rename() {

}

export function download() {
    return createDownloadTask();
}

export function trash(region, bucketName, prefix, keys = []) {
    const comfirmTrash = !remote.dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
            message: `您确定删除${keys.length}个文件吗?`,
            title: '删除提示',
            buttons: ['删除', '取消'],
            cancelId: 1
        }
    );

    if (comfirmTrash) {
        return deleteObject(region, bucketName, prefix, keys);
    }
}

