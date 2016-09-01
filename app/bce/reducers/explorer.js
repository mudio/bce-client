/**
 * Action - Explorder Reducer
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {
    LIST_BUCKET_REQUEST, LIST_BUCKET_SUCCESS, LIST_BUCKET_FAILURE,
    LIST_OBJECT_REQUEST, LIST_OBJECT_SUCCESS, LIST_OBJECT_FAILURE
} from '../actions/window';

const defaultState = {
    isFetching: false,
    didInvalidate: false,
    response: {
        buckets: [],
        folders: [],
        objects: []
    }
};

export default function explorer(state = defaultState, action) {
    switch (action.type) {
    case LIST_OBJECT_REQUEST:
    case LIST_BUCKET_REQUEST:
        return Object.assign({}, defaultState, {
            isFetching: true,
            didInvalidate: false
        });
    case LIST_OBJECT_FAILURE:
    case LIST_BUCKET_FAILURE:
        return Object.assign({}, defaultState, {
            didInvalidate: true,
            error: action.error
        });
    case LIST_OBJECT_SUCCESS:
    case LIST_BUCKET_SUCCESS:
        return Object.assign({}, defaultState, {
            response: action.response
        });
    default:
        return state;
    }
}
