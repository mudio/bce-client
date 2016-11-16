/**
 * Action - Bucket Action & Creater
 *
 * @file bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';
import debug from 'debug';

import URL from '../utils/URL';
import {API_TYPE} from '../middleware/api';
import {getRegionClient} from '../api/client';
import {createUploadTask} from './uploader';

const logger = debug('bce-client:operation');

export const LIST_BUCKET_REQUEST = 'LIST_BUCKET_REQUEST';
export const LIST_BUCKET_SUCCESS = 'LIST_BUCKET_SUCCESS';
export const LIST_BUCKET_FAILURE = 'LIST_BUCKET_FAILURE';

export function listBuckets() {
    return {
        [API_TYPE]: {
            types: [LIST_BUCKET_REQUEST, LIST_BUCKET_SUCCESS, LIST_BUCKET_FAILURE],
            method: 'listBuckets',
            args: []
        }
    };
}


export const LIST_OBJECT_REQUEST = 'LIST_OBJECT_REQUEST';
export const LIST_OBJECT_SUCCESS = 'LIST_OBJECT_SUCCESS';
export const LIST_OBJECT_FAILURE = 'LIST_OBJECT_FAILURE';

export function listObjects(bucketName, prefix = '') {
    return {
        [API_TYPE]: {
            types: [LIST_OBJECT_REQUEST, LIST_OBJECT_SUCCESS, LIST_OBJECT_FAILURE],
            method: 'listObjects',
            args: [bucketName, {delimiter: '/', prefix, maxKeys: 200}]
        }
    };
}

export const LIST_MORE_REQUEST = 'LIST_MORE_REQUEST';
export const LIST_MORE_SUCCESS = 'LIST_MORE_SUCCESS';
export const LIST_MORE_FAILURE = 'LIST_MORE_FAILURE';

export function listMoreObjects(bucketName, prefix = '', marker = '') {
    return {
        [API_TYPE]: {
            types: [LIST_MORE_REQUEST, LIST_MORE_SUCCESS, LIST_MORE_FAILURE],
            method: 'listObjects',
            args: [bucketName, {delimiter: '/', prefix, marker, maxKeys: 200}]
        }
    };
}

export const DELETE_OBJECT_REQUEST = 'DELETE_OBJECT_REQUEST';
export const DELETE_OBJECT_SUCCESS = 'DELETE_OBJECT_SUCCESS';
export const DELETE_OBJECT_FAILURE = 'DELETE_OBJECT_FAILURE';

export function deleteObject(region, bucketName, prefix, objects = []) {
    return (dispatch, getState) => {
        const {auth} = getState();
        const client = getRegionClient(region, auth);

        const allTasks = objects.map(
            key => client.listAllObjects(bucketName, key).then(
                keys => {
                    const removeKeys = keys.map(item => item.key);
                    logger(
                        'Delete bucketName = %s, prefix = %s, keys = %s',
                        bucketName, prefix, removeKeys
                    );

                    const deferred = dispatch({
                        [API_TYPE]: {
                            types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                            method: 'deleteAllObjects',
                            args: [bucketName, removeKeys]
                        }
                    });

                    return deferred;
                },
                error => dispatch({
                    error,
                    type: DELETE_OBJECT_FAILURE
                })
            )
        );

        Q.allSettled(allTasks).finally(
            () => dispatch(listObjects(bucketName, prefix))
        );
    };
}

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

export function listMore(...args) {
    return listMoreObjects(...args);
}
