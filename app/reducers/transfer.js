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
    TRANS_UPLOAD_NEW,
    TRANS_UPLOAD_REMOVE
} from '../actions/uploader';

import {
    UPLOAD_NOTIFY_PROGRESS,
    UPLOAD_NOTIFY_FINISH
} from '../middleware/uploader';

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
    default:
        return state;
    }
}
