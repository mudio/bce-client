/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import WorkFlow from './WorkFlow';
import {warn} from '../utils/Logger';
import UploadQueue from './UploadQueue';
import {UploadStatus} from '../utils/TransferStatus';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

const _workflow = new WorkFlow(UploadQueue);

let _throttleBuffer = {};
const delayNotify = _.throttle(() => {
    _.forEach(_throttleBuffer, message => window.globalStore.dispatch(message));

    _throttleBuffer = {};
}, 500);


function startTask(store, taskIds = []) {
    const {dispatch} = store;
    const {uploads} = store.getState();

    if (taskIds.length > 0) {
        uploads.forEach(item => {
            if (taskIds.indexOf(item.uuid) > -1 && item.status !== UploadStatus.Finish) {
                _workflow.push(item);
            }
        });

        return dispatch({type: UploadNotify.Start, taskIds});
    }
    // 没有指定taskids
    return uploads.forEach(item => {
        if (item.status === UploadStatus.Waiting
            || item.status === UploadStatus.Error
            || item.status === UploadStatus.Suspended) {
            _workflow.push(item);
        }
    });
}

function suspendTask(store, taskIds = []) {
    const {dispatch} = store;

    _workflow.suspend(taskIds);

    return dispatch({type: UploadNotify.Suspending, taskIds});
}

function delaySyncTask(uploadTask) {
    const {uuid, keymap = {}, increaseSize = 0, command} = uploadTask;
    const preInfo = _throttleBuffer[uuid];

    if (preInfo) {
        const size = preInfo.increaseSize + increaseSize;
        Object.assign(preInfo, {
            uuid, keymap, increaseSize: size, type: command
        });
    } else {
        _throttleBuffer[uuid] = {uuid, keymap, increaseSize, type: command};
    }

    delayNotify();
}

export default function upload(store) {
    return next => action => {
        const uploadTask = action[UploadCommandType];

        if (typeof uploadTask === 'undefined') {
            return next(action);
        }

        const {command, taskIds} = uploadTask;

        switch (command) {
        case UploadNotify.Start:
            return startTask(store, taskIds);
        case UploadNotify.Suspending:
            return suspendTask(store, taskIds);
        case UploadNotify.Progress:
            return delaySyncTask(uploadTask);
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, taskIds});
        }
    };
}
