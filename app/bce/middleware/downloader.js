/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import WorkFlow from './WorkFlow';
import {warn} from '../utils/Logger';
import DownloadQueue from './DownloadQueue';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify, DownloadType} from '../utils/TransferNotify';

const _workflow = new WorkFlow(DownloadQueue);

function startTask(store, taskIds = []) {
    const {downloads} = store.getState();
    const {dispatch} = store;

    if (taskIds.length > 0) {
        downloads.forEach(item => {
            if (taskIds.indexOf(item.uuid) > -1 && item.status !== DownloadStatus.Finish) {
                _workflow.push(item);
            }
        });

        return dispatch({type: DownloadNotify.Start, taskIds});
    }
    // 没有指定taskids
    return downloads.forEach(item => {
        if (item.status === DownloadStatus.Waiting) {
            _workflow.push(item);
        }
    });
}

export default function download(store) {
    return next => action => {
        const downloadTask = action[DownloadType];

        if (typeof downloadTask === 'undefined') {
            return next(action);
        }

        const {command, taskIds} = downloadTask;

        switch (command) {
        case DownloadNotify.Start:
            return startTask(store, taskIds);
        default:
            warn('Not Expected Command: %s', command);
            return next({type: command, taskIds});
        }
    };
}
