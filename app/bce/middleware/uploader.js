/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import WorkFlow from './WorkFlow';
import {warn} from '../utils/Logger';
import UploadQueue from './UploadQueue';
import {UploadStatus} from '../utils/TransferStatus';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

const _workflow = new WorkFlow(UploadQueue);

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
        if (item.status === UploadStatus.Waiting) {
            _workflow.push(item);
        }
    });
}

function suspendTask(store, taskIds = []) {
    const {dispatch} = store;

    _workflow.suspend(taskIds);

    return dispatch({type: UploadNotify.Suspending, taskIds});
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
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, taskIds});
        }
    };
}
