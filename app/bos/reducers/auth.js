/**
 * Action - Login Reducer
 *
 * @file login.js
 * @author mudio(job.mudio@gmail.com)
 */

import {
    UPDATE_AUTH,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE
} from '../actions/login';

const defaultState = {
    ak: '',
    sk: '',
    pin: '',
    error: '',
    isAuth: false,
    isLoading: false
};

export default function auth(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_AUTH:
        return Object.assign({}, defaultState, {
            ...action.auth
        });
    case LOGIN_REQUEST:
        return Object.assign({}, state, {
            isLoading: true,
            isAuth: false,
            error: ''
        });
    case LOGIN_SUCCESS:
        return Object.assign({}, state, {
            isLoading: false,
            isAuth: true,
            error: ''
        });
    case LOGIN_FAILURE:
        return Object.assign({}, state, {
            isLoading: false,
            isAuth: false,
            error: action.error
        });
    default:
        return state;
    }
}
