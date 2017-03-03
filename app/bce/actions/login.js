/**
 * Action - Login Action & Creater
 *
 * @file login.js
 * @author mudio(job.mudio@gmail.com)
 */

import {API_TYPE} from '../middleware/api';

export const UPDATE_AUTH = 'UPDATE_AUTH';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

// 没办法，没有更好办法验证ak、sk
export function login(ak, sk, pin) {
    return dispath => {
        dispath({type: UPDATE_AUTH, ak, sk, pin});
        dispath({
            [API_TYPE]: {
                types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
                method: 'listBuckets',
                args: []
            }
        });
    };
}

export function logout(ak = '', sk = '', pin = '') {
    return dispath => {
        dispath({type: UPDATE_AUTH, ak, sk, pin});
    };
}
