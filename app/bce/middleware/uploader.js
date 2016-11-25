/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import {warn} from '../utils/Logger';
import UploadWorkFlow from './UploadWorkFlow';
import {UploadStatus} from '../utils/TransferStatus';
import {UploadNotify, UploadCommandType} from '../utils/TransferNotify';

const _workflow = new UploadWorkFlow();

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

function repairTask(uploadTasks, taskIds = []) {
    uploadTasks.forEach(item => {
        if (taskIds.indexOf(item.uuid) > -1 && item.status === UploadStatus.Error) {
            // 如果状态不是错误态，则给出⚠️
            if (item.status !== UploadStatus.Error) {
                warn('Attempt to repair %s task', item.status);
            }
            // 复制一份
            // const metaKeys = [...item.errorQueue];
            // 修复任务
            // dispatch({type: UploadNotify.Repair, uuid: item.uuid});
        }
    });
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
        case UploadNotify.Repair:
            return repairTask(store, taskIds);
        default:
            warn('Invalid MiddleWare Command %s', command);
            return next({type: command, taskIds});
        }
    };
}
