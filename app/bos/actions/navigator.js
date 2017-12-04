/**
 * Action - Navigator Action & Creater
 *
 * @file navigator.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';

import {listBuckets, listObjects} from './window';

export const UPDATE_NAV = 'UPDATE_NAV';

export function redirect(config = {}) {
    return dispatch => {
        const {bucket, prefix} = config;

        dispatch({type: UPDATE_NAV, bucket, prefix});
        dispatch(query({bucket, prefix}));
    };
}

export function query(config = {}) {
    return dispatch => {
        const {bucket, prefix = '', search = ''} = config;

        if (!bucket) {
            dispatch(listBuckets({search}));
        } else {
            let searchPrefix = '';
            if (prefix || search) {
                searchPrefix = path.posix.join(prefix, search);
            }

            dispatch(listObjects(bucket, searchPrefix));
        }
    };
}
