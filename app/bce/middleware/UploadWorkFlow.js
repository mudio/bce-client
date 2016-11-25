/**
 * MiddleWare - WorkFlow MiddleWare
 *
 * @file WorkFlow.js
 * @author mudio(job.mudio@gmail.com)
 */

import async from 'async';
import {EventEmitter} from 'events';

import {UploadConfig} from '../config';
import UploadQueue from './UploadQueue';

export default class WorkFlow extends EventEmitter {
    constructor() {
        super();

        this._queue = async.queue(
            (...args) => this._callback(...args), UploadConfig.TaskLimit
        );

        this._queue.empty = () => this.emit('empty');
        this._queue.drain = () => this.emit('drain');
        this._queue.error = () => this.emit('error');
        this._queue.saturated = () => this.emit('saturated');
        this._queue.unsaturated = () => this.emit('unsaturated');
    }

    _callback(task, done) {
        const taskQueue = new UploadQueue(task);
        // 队列为空，表示当前任务都被处理完了。
        taskQueue.on('empty', () => done());
    }

    push(...args) {
        return this._queue.push(...args);
    }
}
