/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import WorkFlow from './WorkFlow';
import {warn} from '../../utils/logger';
import DownloadQueue from './DownloadQueue';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify, DownloadCommandType} from '../utils/TransferNotify';

const _workflow = new WorkFlow(DownloadQueue);

let _throttleBuffer = {};
const delayNotify = _.throttle(() => {
    _.forEach(_throttleBuffer, message => window.globalStore.dispatch(message));

    _throttleBuffer = {};
}, 500);

function startTask(store, taskIds = []) {
    const {downloads} = store.getState();
    const {dispatch} = store;

    if (taskIds.length > 0) {
        downloads.forEach(item => {
            if (taskIds.indexOf(item.uuid) > -1 && item.status !== DownloadStatus.Finish) {
                _workflow.push(item);
            }
        });
    } else {
    // 没有指定taskids
        downloads.forEach(item => {
            if (item.status === DownloadStatus.Waiting
                || item.status === DownloadStatus.Error
                || item.status === DownloadStatus.Suspended) {
                taskIds.push(item.uuid);
                _workflow.push(item);
            }
        });
    }

    return dispatch({type: DownloadNotify.Start, taskIds});
}

function suspendTask(store, taskIds = []) {
    const {dispatch} = store;

    _workflow.suspend(taskIds);

    return dispatch({type: DownloadNotify.Suspending, taskIds});
}

function delaySyncTask(downloadTask) {
    const {uuid, increaseSize = 0, command} = downloadTask;
    const preInfo = _throttleBuffer[uuid];

    if (preInfo) {
        const size = preInfo.increaseSize + increaseSize;
        Object.assign(preInfo, {
            uuid, increaseSize: size, type: command
        });
    } else {
        _throttleBuffer[uuid] = {uuid, increaseSize, type: command};
    }

    delayNotify();
}

export default function download(store) {
    return next => action => {
        const downloadTask = action[DownloadCommandType];

        if (typeof downloadTask === 'undefined') {
            return next(action);
        }

        const {command, taskIds} = downloadTask;

        switch (command) {
        case DownloadNotify.Start:
            return startTask(store, taskIds);
        case DownloadNotify.Suspending:
            return suspendTask(store, taskIds);
        case DownloadNotify.Progress:
            return delaySyncTask(downloadTask);
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, taskIds});
        }
    };
}
