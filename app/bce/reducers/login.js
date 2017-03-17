/**
 * Action - Login Reducer
 *
 * @file login.js
 * @author mudio(job.mudio@gmail.com)
 */

import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE
} from '../actions/login';

const defaultState = {isAuth: false, isLoading: false, error: ''};

export default function login(state = defaultState, {type, error}) {
    switch (type) {
    case LOGIN_REQUEST:
        return Object.assign({}, defaultState, {isLoading: true});
    case LOGIN_SUCCESS:
        return Object.assign({}, defaultState, {isAuth: true});
    case LOGIN_FAILURE:
        return Object.assign({}, defaultState, {error});
    default:
        return state;
    }
}
