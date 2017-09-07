/**
 * Action - Transfer Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {UploadNotify} from '../utils/TransferNotify';
import {UploadStatus} from '../utils/TransferStatus';

export default function uploads(state = [], action) {
    switch (action.type) {
    case UploadNotify.New: {
        const task = Object.assign({status: UploadStatus.Waiting}, action);

        delete task.type;

        return [task, ...state];
    }
    case UploadNotify.Start:
        return state.map(item => {
            const {uuid, uploadId, localPath} = action;
            if (uuid === item.uuid) {
                if (uploadId) {
                    item.keymap[localPath].uploadId = uploadId;
                }
                item.status = UploadStatus.Running;

                return item;
            }

            return item;
        });
    case UploadNotify.Waiting:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                return Object.assign(item, {status: UploadStatus.Waiting});
            }

            return item;
        });
    case UploadNotify.Paused:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                return Object.assign(item, {status: UploadStatus.Paused});
            }

            return item;
        });
    case UploadNotify.FinishPart: {
        return state.map(item => {
            const {uuid, localPath} = action;
            if (item.uuid === uuid) {
                item.keymap[localPath].finish = true; // eslint-disable-line

                return item;
            }

            return item;
        });
    }
    case UploadNotify.Finish:
        return state.map(item => {
            if (item.uuid === action.uuid) {
                item.keymap[action.localPath].finish = true; // eslint-disable-line
                item.status = UploadStatus.Finish; // eslint-disable-line
                item.offsetSize = item.totalSize;
                item.rate = 0;

                return item;
            }

            return item;
        });
    case UploadNotify.Progress:
        return state.map(item => {
            const {uuid, rate, offsetSize} = action;

            if (item.uuid === uuid && item.status === UploadStatus.Running) {
                return Object.assign(item, {rate, offsetSize});
            }

            return item;
        });
    case UploadNotify.Error:
        return state.map(item => {
            const {uuid, error} = action;

            if (item.uuid === uuid) {
                return Object.assign(item, {error, status: UploadStatus.Error});
            }

            return item;
        });
    case UploadNotify.Remove: {
        return state.filter(item => action.uuid !== item.uuid);
    }
    case UploadNotify.ClearFinish: {
        return state.filter(item => item.status !== UploadStatus.Finish);
    }
    default:
        return state;
    }
}
