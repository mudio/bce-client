/**
 * Action - Transfer Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {error as errLogger} from '../utils/Logger';
import {UploadNotify} from '../utils/TransferNotify';
import {UploadStatus} from '../utils/TransferStatus';

/**
 * upload task model
 *  - id                    自增主键
 *  - name                  任务名称
 *  - category              file / directory
 *  - totalSize             总任务大小
 *  - offsetSize            已传输大小
 *  - status                任务状态
 *  - region                地区
 *  - bucket                bucket
 *  - prefix                bos绝对路径
 *  - waitingQueue: [id]    等待队列
 *  - completeQueue: []     完成队列
 *  - errorQueue: []        错误对垒
 * -----------------------------------------------
 *      - relative          bos相对路径
 *      - path              文件路径
 *      - totalSize         任务大小
 *      - offsetSize        已上传大小
 *      - uploadId          上传任务ID   // option
 *      - parts             分片集合     // option
 *          - partNumber    片id
 *          - eTag          片md5
 *      - finish            是否完成
 *      - error             错误信息
 */

const defaultProperty = {
    totalSize: 0,
    offsetSize: 0,
    waitingQueue: [],
    completeQueue: [],
    errorQueue: []
};

export default function uploads(state = [], action) {
    switch (action.type) {
    case UploadNotify.Prepare: {
        const task = Object.assign({}, defaultProperty, action, {
            status: UploadStatus.Indexing
        });

        delete task.type;

        return [task, ...state];
    }
    case UploadNotify.New: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                return Object.assign(item, {
                    totalSize: action.totalSize,
                    status: UploadStatus.Unstarted,
                    waitingQueue: action.keys
                });
            }
            return item;
        });
    }
    case UploadNotify.Start:
        return state.map(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                return Object.assign(item, {status: UploadStatus.Waiting});
            }

            return item;
        });
    case UploadNotify.Launch:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                const errorQueue = [];
                const waitingQueue = [...item.waitingQueue, ...item.errorQueue];
                // Launch会把未完成、错误的重跑
                return Object.assign(item, {
                    errorQueue,
                    waitingQueue,
                    status: UploadStatus.Running
                });
            }

            return item;
        });
    case UploadNotify.Repair:
        return state.map(item => {
            if (item.uuid === action.uuid) {
                const waitingQueue = [...item.waitingQueue, ...item.errorQueue];
                const errorQueue = [];
                return Object.assign(item, {waitingQueue, errorQueue, status: UploadStatus.Running});
            }

            return item;
        });
    case UploadNotify.Progress:
        return state.map(item => {
            const {increaseSize, uuid} = action;

            if (item.uuid === uuid) {
                return Object.assign(item, {
                    offsetSize: item.offsetSize + increaseSize,
                });
            }

            return item;
        });
    case UploadNotify.Finish:
        return state.map(item => {
            if (item.uuid === action.uuid) {
                if (action.metaKey) {
                    const waitingQueue = item.waitingQueue.filter(key => key !== action.metaKey);
                    const completeQueue = [action.metaKey, ...item.completeQueue];
                    Object.assign(item, {waitingQueue, completeQueue});
                }

                if (item.waitingQueue.length === 0 && item.errorQueue.length === 0) {
                    Object.assign(item, {status: UploadStatus.Finish, offsetSize: item.totalSize});
                }
            }

            return item;
        });
    case UploadNotify.Error: {
        return state.map(item => {
            const {uuid, metaKey, error} = action;

            if (item.uuid === uuid) {
                if (metaKey) {
                    const waitingQueue = item.waitingQueue.filter(key => key !== metaKey);
                    const errorQueue = [metaKey, ...item.errorQueue];
                    Object.assign(item, {waitingQueue, errorQueue});
                }

                Object.assign(item, {status: UploadStatus.Error, error});
            }

            return item;
        });
    }
    case UploadNotify.Remove: {
        return state.filter(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                const {waitingQueue, completeQueue, errorQueue} = item;
                errorQueue.forEach(key => localStorage.removeItem(key));
                completeQueue.forEach(key => localStorage.removeItem(key));
                waitingQueue.forEach(key => localStorage.removeItem(key));
            }

            return action.taskIds.indexOf(item.uuid) === -1;
        });
    }
    case UploadNotify.ClearFinish: {
        return state.filter(item => {
            if (item.status === UploadStatus.Finish) {
                const {waitingQueue, completeQueue, errorQueue} = item;

                if (waitingQueue.length > 0 || errorQueue.length > 0) {
                    errLogger('Invoke CleanrFinish error, WaitingQueue or ErrorQueue not empty');
                }

                errorQueue.forEach(key => localStorage.removeItem(key));
                completeQueue.forEach(key => localStorage.removeItem(key));
                waitingQueue.forEach(key => localStorage.removeItem(key));
            }

            return item.status !== UploadStatus.Finish;
        });
    }
    default:
        return state;
    }
}
