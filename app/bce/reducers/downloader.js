/**
 * Action - Donloader Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify} from '../utils/TransferNotify';

export default function downloads(state = [], action) {
    switch (action.type) {
    case DownloadNotify.New: {
        const task = Object.assign({status: DownloadStatus.Waiting, loaded: 0}, action.item);
        return state.concat([task]);
    }
    case DownloadNotify.Progress: {
        return state.map(item => {
            const {increaseSize, id} = action;
            if (item.id === id) {
                return Object.assign({}, item, {
                    loaded: item.loaded + increaseSize,
                    status: DownloadStatus.Running
                });
            }
            return Object.assign({}, item);
        });
    }
    case DownloadNotify.Finish: {
        return state.map(item => {
            if (item.id === action.id) {
                return Object.assign({}, item, {status: DownloadStatus.Finish, loaded: item.size});
            }
            return Object.assign({}, item);
        });
    }
    case DownloadNotify.Error: {
        return state.map(item => {
            const {id, error} = action;
            if (item.id === id) {
                return Object.assign({}, item, {status: DownloadStatus.Error, error});
            }
            return Object.assign({}, item);
        });
    }
    default:
        return state;
    }
}
