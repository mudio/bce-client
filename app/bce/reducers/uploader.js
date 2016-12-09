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
 * -----------------------------------------------
 * upload task model
 * -----------------------------------------------
 *  - id                    自增主键
 *  - name                  任务名称
 *  - category              file / directory
 *  - totalSize             总任务大小
 *  - offsetSize            已传输大小
 *  - status                任务状态
 *  - region                地区
 *  - bucket                bucket
 *  - prefix                bos绝对路径
 *  - keymap
 *      - key               keymap key
 *      - waiting           等待任务数
 *      - error             错误任务数
 *      - complete          完成任务数
 * -----------------------------------------------
 * localStorage keymap model
 * -----------------------------------------------
 * - waitingQueue           meta key集合
 * - errorQueue             meta key集合
 * - completeQueue          meta key集合
 * -----------------------------------------------
 * localStorage meta model
 * -----------------------------------------------
 * - relative               bos相对路径
 * - path                   文件路径
 * - totalSize              任务大小
 * - offsetSize             已上传大小
 * - uploadId               上传任务ID
 * - finish                 是否完成
 * - error                  错误信息
 */

const defaultProperty = {
    totalSize: 0,
    offsetSize: 0,
    keymap: {waiting: 0, error: 0, complete: 0}
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
                    keymap: action.keymap
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
                    status: UploadStatus.Running,
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
    case UploadNotify.Suspending:
        return state.map(item => {
            if (action.taskIds.indexOf(item.uuid) > -1) {
                return Object.assign(item, {status: UploadStatus.Suspending});
            }

            return item;
        });
    case UploadNotify.Suspended:
        return state.map(item => {
            if (action.taskId === item.uuid) {
                return Object.assign(item, {status: UploadStatus.Suspended});
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
                // 同步启动状态
                return Object.assign(item, {
                    keymap: action.keymap,
                    status: UploadStatus.Finish
                });
            }

            return item;
        });
    case UploadNotify.Error:
        return state.map(item => {
            const {uuid, error, keymap} = action;

            if (item.uuid === uuid) {
                return Object.assign(item, {error, keymap, status: UploadStatus.Error});
            }

            return item;
        });
    case UploadNotify.Remove: {
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
    case UploadNotify.ClearFinish: {
        return state.filter(item => {
            if (item.status === UploadStatus.Finish) {
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

            return item.status !== UploadStatus.Finish;
        });
    }
    default:
        return state;
    }
}
