/**
 * Action - Auth Reducer
 *
 * @file auth.js
 * @author mudio(job.mudio@gmail.com)
 */

import {UPDATE_AUTH} from '../actions/login';

export default function auth(state, {type, ak, sk, pin}) {
    switch (type) {
    case UPDATE_AUTH:
        return {ak, sk, pin};
    default:
        return state || {ak: '', sk: '', pin: ''};
    }
}
