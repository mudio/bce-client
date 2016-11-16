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

export function trash(...args) {
    return deleteObject(...args);
}

export function listMore(...args) {
    return listMoreObjects(...args);
}
