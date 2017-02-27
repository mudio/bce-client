/**
 * Action - Donloader Reducer
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {error as errLogger} from '../utils/logger';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify} from '../utils/TransferNotify';

const defaultProperty = {
    totalSize: 0,
    offsetSize: 0,
    keymap: {waiting: 0, error: 0, complete: 0}
};

export default function downloads(state = [], action) {
    switch (action.type) {
    case DownloadNotify.Init: {
        const task = Object.assign({}, defaultProperty, action, {
            status: DownloadStatus.Init
        });

        delete task.type;

        return [task, ...state];
    }
    case DownloadNotify.New: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                return Object.assign(item, {
                    totalSize: action.totalSize,
                    status: DownloadStatus.Unstarted,
                    keymap: action.keymap
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
                const {keymap} = item;
                // 读取配置
                const queueMap = JSON.parse(localStorage.getItem(keymap.key));
                // Launch会把未完成、错误的重跑
                queueMap.waitingQueue = [...queueMap.waitingQueue, ...queueMap.errorQueue];
                queueMap.errorQueue = [];
                // 保存配置
                localStorage.setItem(keymap.key, JSON.stringify(queueMap));
                // 同步启动状态
                return Object.assign(item, {
                    status: DownloadStatus.Running,
                    keymap: {
                        key: keymap.key,
                        error: queueMap.errorQueue.length,
                        waiting: queueMap.waitingQueue.length,
                        complete: queueMap.completeQueue.length
                    }
                });
            }

            return item;
        });
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
    case DownloadNotify.Finish: {
        return state.map(item => {
            if (item.uuid === action.uuid) {
                // 同步启动状态
                return Object.assign(item, {
                    keymap: action.keymap,
                    status: DownloadStatus.Finish
                });
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
        return state.filter(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                const {keymap} = item;
                // 读取配置
                const queueMap = JSON.parse(localStorage.getItem(keymap.key));
                const {waitingQueue, completeQueue, errorQueue} = queueMap;
                // 删除子任务
                errorQueue.forEach(key => localStorage.removeItem(key));
                completeQueue.forEach(key => localStorage.removeItem(key));
                waitingQueue.forEach(key => localStorage.removeItem(key));
                // 删除keymap
                localStorage.removeItem(keymap.key);
            }

            return action.taskIds.indexOf(item.uuid) === -1;
        });
    }
    case DownloadNotify.ClearFinish: {
        return state.filter(item => {
            if (item.status === DownloadStatus.Finish) {
                const {keymap} = item;
                // 读取配置
                const queueMap = JSON.parse(localStorage.getItem(keymap.key));
                const {waitingQueue, completeQueue, errorQueue} = queueMap;
                // 删除子任务
                if (waitingQueue.length > 0 || errorQueue.length > 0) {
                    errLogger('Invoke CleanrFinish error, WaitingQueue or ErrorQueue not empty');
                }
                errorQueue.forEach(key => localStorage.removeItem(key));
                completeQueue.forEach(key => localStorage.removeItem(key));
                waitingQueue.forEach(key => localStorage.removeItem(key));
                // 删除keymap
                localStorage.removeItem(keymap.key);
            }

            return item.status !== DownloadStatus.Finish;
        });
    }
    default:
        return state;
    }
}
