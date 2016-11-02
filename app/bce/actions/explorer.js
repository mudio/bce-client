/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import URL from '../utils/URL';
import {createUploadTask} from './uploader';
import {createDownloadTask} from './downloader';
import {listBuckets, listObjects, deleteObject, listMoreObjects} from './window';

export const UPDATE_NAV = 'UPDATE_NAV';

export function updateNavigator(nav) {
    return dispatch => {
        const URLObj = new URL(nav);
        const region = URLObj.getRegion();
        const bucket = URLObj.getBucket();
        const folder = URLObj.getFolder();

        dispatch({type: UPDATE_NAV, nav: {region, bucket, folder}});

        if (!bucket) {
            dispatch(listBuckets(region));
        } else {
            dispatch(listObjects(bucket, folder));
        }
    };
}

export function refresh(bucketName, prefix) {
    return dispatch => dispatch(listObjects(bucketName, prefix));
}

export function uploadFile(...args) {
    return createUploadTask(...args);
}

export const MENU_COPY_TYPE = Symbol('COPY');
export const MENU_MOVE_TYPE = Symbol('MOVE');
export const MENU_VIEW_TYPE = Symbol('VIEW');
export const MENU_SHARE_TYPE = Symbol('SHARE');
export const MENU_RENAME_TYPE = Symbol('RENAME');
export const MENU_DOWNLOAD_TYPE = Symbol('DOWNLOAD');

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

export function download(...args) {
    return createDownloadTask(...args);
}

export function trash(item) {
    return deleteObject(item.key);
}

export function listMore(...args) {
    return listMoreObjects(...args);
}
