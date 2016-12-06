/**
 * Action - Donloader Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {error as errLogger} from '../utils/Logger';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify} from '../utils/TransferNotify';

export default function downloads(state = [], action) {
    switch (action.type) {
    case DownloadNotify.Init: {
        const task = Object.assign({
            offsetSize: 0,
            errorQueue: [],
            waitingQueue: [],
            completeQueue: [],
            status: DownloadStatus.Init
        }, action);

        delete task.type;

        return [task, ...state];
    }
    case DownloadNotify.New: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                return Object.assign(item, {
                    totalSize: action.totalSize,
                    status: DownloadStatus.Unstarted,
                    waitingQueue: action.keys
                });
            }

            return item;
        });
    }
    case DownloadNotify.Start:
        return state.map(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                return Object.assign(item, {status: DownloadStatus.Waiting});
            }

            return item;
        });
    case DownloadNotify.Launch:
        return state.map(item => {
            if (action.uuid === item.uuid) {
                const errorQueue = [];
                const waitingQueue = [...item.waitingQueue, ...item.errorQueue];
                // Launch会把未完成、错误的重跑
                return Object.assign(item, {
                    errorQueue,
                    waitingQueue,
                    status: DownloadStatus.Running
                });
            }

            return item;
        });
    case DownloadNotify.Progress: {
        return state.map(item => {
            const {increaseSize, uuid} = action;

            if (item.uuid === uuid) {
                return Object.assign(item, {
                    offsetSize: item.offsetSize + increaseSize,
                });
            }

            return item;
        });
    }
    case DownloadNotify.Suspending:
        return state.map(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                return Object.assign(item, {status: DownloadStatus.Suspending});
            }

            return item;
        });
    case DownloadNotify.Suspended:
        return state.map(item => {
            if (action.taskId === item.uuid) {
                return Object.assign(item, {status: DownloadStatus.Suspended});
            }

            return item;
        });
    case DownloadNotify.Finish: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                if (action.metaKey) {
                    const waitingQueue = item.waitingQueue.filter(key => key !== action.metaKey);
                    const completeQueue = [action.metaKey, ...item.completeQueue];
                    Object.assign(item, {waitingQueue, completeQueue});
                }

                if (item.waitingQueue.length === 0 && item.errorQueue.length === 0) {
                    Object.assign(item, {status: DownloadStatus.Finish, offsetSize: item.totalSize});
                }
            }

            return item;
        });
    }
    case DownloadNotify.Error: {
        return state.map(item => {
            const {uuid, metaKey, error} = action;

            if (item.uuid === uuid) {
                if (metaKey) {
                    const waitingQueue = item.waitingQueue.filter(key => key !== metaKey);
                    const errorQueue = [metaKey, ...item.errorQueue];
                    Object.assign(item, {waitingQueue, errorQueue});
                }

                Object.assign(item, {status: DownloadStatus.Error, error});
            }

            return item;
        });
    }
    case DownloadNotify.Remove: {
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
    case DownloadNotify.ClearFinish: {
        return state.filter(item => {
            if (item.status === DownloadStatus.Finish) {
                const {waitingQueue, completeQueue, errorQueue} = item;

                if (waitingQueue.length > 0 || errorQueue.length > 0) {
                    errLogger('Invoke CleanrFinish error, WaitingQueue or ErrorQueue not empty');
                }

                errorQueue.forEach(key => localStorage.removeItem(key));
                completeQueue.forEach(key => localStorage.removeItem(key));
                waitingQueue.forEach(key => localStorage.removeItem(key));
            }

            return item.status !== DownloadStatus.Finish;
        });
    }
    default:
        return state;
    }
}
