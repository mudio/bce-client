/**
 * Action - Login Action & Creater
 *
 * @file login.js
 * @author mudio(job.mudio@gmail.com)
 */

import {BosClient} from 'bce-sdk-js';

import GlobalConfig from '../../main/ConfigManager';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_SET_PIN = 'LOGIN_SET_PIN';

// 没办法，没有更好办法验证ak、sk
export function login(ak, sk) {
    return dispath => {
        const _client = new BosClient({
            credentials: {ak, sk},
            endpoint: GlobalConfig.resolveEndpoint()
        });

        dispath({type: LOGIN_REQUEST, loading: true});

        return _client.listBuckets().then(
            () => dispath({type: LOGIN_SUCCESS, ak, sk}),
            err => {
                dispath({type: LOGIN_FAILURE});
                return Promise.reject(err);
            }
        );
    };
}

export function setPinCode(pin) {
    return {type: LOGIN_SET_PIN, pin};
}

export function logout() {
    return {type: LOGIN_FAILURE};
}
