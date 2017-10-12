/**
 * Action - Navigator Action & Creater
 *
 * @file navigator.js
 * @author mudio(job.mudio@gmail.com)
 */

import {listBuckets, listObjects} from './window';

export const UPDATE_NAV = 'UPDATE_NAV';

export function redirect(config = {}) {
    return dispatch => {
        const {region, bucket, prefix} = config;

        dispatch({type: UPDATE_NAV, region, bucket, prefix});

        if (!bucket) {
            dispatch(listBuckets(region));
        } else {
            dispatch(listObjects(bucket, prefix));
        }
    };
}
