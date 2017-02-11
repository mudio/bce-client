/**
 * 进程 - 基础通讯服务
 *
 * @file Entry.js
 * @author mudio(job.mudio@gmail.com)
 */

import childProcess from 'child_process';

import {getUuid} from '../bce/utils/utils';
import {error, warn, info} from '../bce/utils/logger';

const _eventPool = {};

class Process {
    constructor(path) {
        this._process = childProcess.fork(path);

        // 绑定事件
        this._process.on('error', err => this._onError(err));
        this._process.on('exit', () => warn('ChildProcess exit!'));
        this._process.on('close', () => warn('ChildProcess close!'));
        this._process.on('message', message => this._onMessage(message));
        this._process.on('disconnect', () => warn('ChildProcess disconnect!'));
    }

    _onError(err) {
        error('ChildProcess Error = %s', err.message);
    }

    _onMessage(message) {
        const {uuid, success, body} = message;

        if (!uuid || !_eventPool[uuid]) {
            if (Array.isArray(body)) {
                return info(...body);
            }
            return info(body);
        }

        if (success) {
            _eventPool[uuid].resolve(body);
        } else {
            _eventPool[uuid].reject(body);
        }

        delete _eventPool[uuid];
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            const uuid = getUuid();

            _eventPool[uuid] = {resolve, reject};

            this._process.send({uuid, message}, err => reject(err));
        });
    }
}

export const uploadProcess = new Process('upload.process.js');
export const downloadProcess = new Process('download.js');
