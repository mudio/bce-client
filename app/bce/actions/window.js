/**
 * Action - Bucket Action & Creater
 *
 * @file bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';
import {API_TYPE} from '../middleware/api';
import {getRegionClient} from '../api/client';

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

export function deleteObject(prefix) {
    return (dispatch, getState) => {
        const {auth, navigator} = getState();
        const {region, bucket, folder} = navigator;
        const client = getRegionClient(region, auth);

        client.listRawObjects(bucket, {prefix}).then(
            response => {
                const {contents} = response.body;
                const keys = contents.map(item => item.key);

                const deferred = dispatch({
                    [API_TYPE]: {
                        types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                        method: 'deleteMultipleObjects',
                        args: [bucket, [...keys]]
                    }
                });

                if (Q.isPromise(deferred)) {
                    deferred.finally(() => dispatch(
                        listObjects(bucket, folder)
                    ));
                }
            },
            response => dispatch({
                type: DELETE_OBJECT_FAILURE,
                error: response.body
            })
        );
    };
}
