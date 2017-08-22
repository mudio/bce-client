/**
 * Action - Auth Reducer
 *
 * @file auth.js
 * @author mudio(job.mudio@gmail.com)
 */

import {LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_SET_PIN, LOGIN_FAILURE} from '../actions/login';

export default function auth(state = {}, {type, ak, sk, pin, loading}) {
    switch (type) {
    case LOGIN_REQUEST:
        return Object.assign(state, {loading});
    case LOGIN_SUCCESS:
        return Object.assign(state, {ak, sk, loading});
    case LOGIN_SET_PIN:
        return Object.assign(state, {pin});
    case LOGIN_FAILURE:
        return {loading};
    default:
        return Object.assign(state, {loading});
    }
}
