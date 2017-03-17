/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {deleteObject, listObjects, listBuckets} from './window';

export const UPDATE_NAV = 'UPDATE_NAV';

export function redirect(region, bucket, prefix) {
    return dispatch => {
        dispatch({type: UPDATE_NAV, region, bucket, prefix});

        if (!bucket) {
            dispatch(listBuckets(region));
        } else {
            dispatch(listObjects(bucket, prefix));
        }
    };
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

export function trash(...args) {
    return deleteObject(...args);
}
