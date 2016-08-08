/**
 * Action - Transfer Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {
    TRANS_WATING,
    TRANS_RUNNING,
    TRANS_FINISH
} from '../utils/TransferStatus';
import {
    TRANS_UPLOAD_NEW
} from '../actions/uploader';

import {
    UPLOAD_NOTIFY_PROGRESS,
    UPLOAD_NOTIFY_FINISH
} from '../middleware/uploader';

import {
    TRANS_DOWNLOAD_NEW
} from '../actions/downloader';

import {
    DOWNLOAD_NOTIFY_FINISH,
    DOWNLOAD_NOTIFY_PROGRESS
} from '../middleware/downloader';


export function uploads(state = [], action) {
    switch (action.type) {
    case TRANS_UPLOAD_NEW: {
        const task = Object.assign({status: TRANS_WATING}, action);
        delete task.type;
        return state.concat([task]);
    }
    case UPLOAD_NOTIFY_PROGRESS:
        return state.map(item => {
            const {loaded, uploadId} = action;
            if (item.uploadId === uploadId) {
                return Object.assign({}, item, {loaded, status: TRANS_RUNNING});
            }
            return Object.assign({}, item);
        });
    case UPLOAD_NOTIFY_FINISH:
        return state.map(item => {
            const {uploadId} = action;
            if (item.uploadId === uploadId) {
                return Object.assign({}, item, {status: TRANS_FINISH});
            }
            return Object.assign({}, item);
        });
    default:
        return state;
    }
}

export function downloads(state = [], action) {
    switch (action.type) {
    case TRANS_DOWNLOAD_NEW: {
        const task = Object.assign({status: TRANS_WATING, loaded: 0}, action.item);
        return state.concat([task]);
    }
    case DOWNLOAD_NOTIFY_PROGRESS: {
        return state.map(item => {
            const {loaded, path} = action;
            if (item.path === path) {
                return Object.assign({}, item, {loaded, status: TRANS_RUNNING});
            }
            return Object.assign({}, item);
        });
    }
    case DOWNLOAD_NOTIFY_FINISH: {
        return state.map(item => {
            const {path} = action;
            if (item.path === path) {
                return Object.assign({}, item, {status: TRANS_FINISH, loaded: item.size});
            }
            return Object.assign({}, item);
        });
    }
    default:
        return state;
    }
}
