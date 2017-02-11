/**
 * MiddleWare - WorkFlow MiddleWare
 *
 * @file WorkFlow.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import async from 'async';
import {EventEmitter} from 'events';

import {error} from '../utils/logger';

export default class WorkFlow extends EventEmitter {
    constructor(QueueClassType, workflowLimit = 5) {
        super();

        this._metaType = QueueClassType;
        // 任务句柄
        this._handle = {};
        // 任务队列
        this._queue = async.queue(
            (task, done) => this._invoke(task, done),
            workflowLimit
        );

        this._queue.empty = () => this.emit('empty');
        this._queue.drain = () => this.emit('drain');
        this._queue.error = () => this.emit('error');
        this._queue.saturated = () => this.emit('saturated');
        this._queue.unsaturated = () => this.emit('unsaturated');
    }

    _invoke(task, done) {
        const uuid = task.uuid;
        const metaInstance = new this._metaType(task);
        // 队列为空，表示当前任务都被处理完了。
        metaInstance.on('drain', () => {
            // 释放
            delete this._handle[uuid];
            done();
        });
        metaInstance.on('suspend', () => done());

        this._handle[uuid] = metaInstance;
    }

    push(...args) {
        return this._queue.push(...args);
    }

    suspend(taskIds = []) {
        if (taskIds.length > 0) {
            taskIds.forEach(id => {
                const queue = this._handle[id];

                if (queue) {
                    queue.suspend();

                    delete this._handle[id];
                } else {
                    error('Attempt to suspend invalid task id = %s', id);
                }
            });
        } else {
            this._queue.kill();

            _.forEach(this._handle, queue => queue.suspend());

            this._handle = {};
        }
    }
}
