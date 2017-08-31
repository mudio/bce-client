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
    case DownloadNotify.Init: {
        const task = Object.assign({status: DownloadStatus.Init}, action);

        delete task.type;

        return [task, ...state];
    }
    case DownloadNotify.New: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                return Object.assign(item, {
                    totalSize: action.totalSize,
                    status: DownloadStatus.Paused,
                    keymap: action.keymap
                });
            }

            return item;
        });
    }
    case DownloadNotify.Start:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                return Object.assign(item, {status: DownloadStatus.Running});
            }

            return item;
        });
    case DownloadNotify.Paused:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                return Object.assign(item, {status: DownloadStatus.Paused});
            }

            return item;
        });
    case DownloadNotify.Progress: {
        return state.map(item => {
            const {uuid, rate, offsetSize} = action;

            if (item.uuid === uuid && item.status === DownloadStatus.Running) {
                return Object.assign(item, {rate, offsetSize});
            }

            return item;
        });
    }
    case DownloadNotify.Finish: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                item.keymap[action.objectKey].finish = true; // eslint-disable-line
                item.status = DownloadStatus.Finish; // eslint-disable-line
                item.offsetSize = item.totalSize;
                item.rate = 0;

                return item;
            }

            return item;
        });
    }
    case DownloadNotify.FinishPart: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                item.keymap[action.objectKey].finish = true; // eslint-disable-line

                return item;
            }

            return item;
        });
    }
    case DownloadNotify.Error: {
        return state.map(item => {
            const {uuid, error, keymap} = action;

            if (item.uuid === uuid) {
                return Object.assign(item, {error, keymap, status: DownloadStatus.Error});
            }

            return item;
        });
    }
    case DownloadNotify.Remove: {
        return state.filter(item => action.uuid !== item.uuid);
    }
    case DownloadNotify.ClearFinish: {
        return state.filter(item => item.status !== DownloadStatus.Finish);
    }
    default:
        return state;
    }
}
