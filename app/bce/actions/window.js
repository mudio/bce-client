/**
 * Action - Bucket Action & Creater
 *
 * @file bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import {API_TYPE} from '../middleware/api';

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
            args: [bucketName, {delimiter: '/', prefix}]
        }
    };
}
