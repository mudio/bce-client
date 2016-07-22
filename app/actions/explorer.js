/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import URL from '../utils/URL';
import {listBuckets, listObjects} from './window';
import {createUploadTask} from './uploader';
import {createDownloadTask} from './downloader';

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

export function uploadFile(...args) {
    return createUploadTask(...args);
}

export function downloadFile(...args) {
    return createDownloadTask(...args);
}

export const MENU_COPY_TYPE = Symbol('COPY');
export const MENU_MOVE_TYPE = Symbol('MOVE');
export const MENU_VIEW_TYPE = Symbol('VIEW');
export const MENU_SHARE_TYPE = Symbol('SHARE');
export const MENU_RENAME_TYPE = Symbol('RENAME');
export const MENU_DOWNLOAD_TYPE = Symbol('DOWNLOAD');

export function copy(data) {

}

export function move(data) {

}

export function view(data) {

}

export function share(data) {

}

export function rename(data) {

}

export function download(data) {

}

export function trash(data) {

}
