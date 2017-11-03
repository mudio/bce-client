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
        const {bucket, prefix = '', search = ''} = config;

        dispatch({type: UPDATE_NAV, bucket, prefix});

        if (!bucket) {
            dispatch(listBuckets());
        } else {
            let searchPrefix = '';
            if (prefix || search) {
                searchPrefix = path.posix.join(prefix, search);
            }

            dispatch(listObjects(bucket, searchPrefix));
        }
    };
}
