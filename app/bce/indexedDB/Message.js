/**
 * Worker - 基础通讯服务
 *
 * @file Message.js
 * @author mudio(job.mudio@gmail.com)
 */

import EventEmitter from 'events';

import _ from 'lodash';
import getUuid from '../utils/Uuid';
import IdbEntry from './worker/index.worker';
import {workerLogger} from '../utils/Logger';

const _eventPool = {};
const _worker = new IdbEntry();
export const emiter = new EventEmitter();

_worker.onmessage = evt => {
    try {
        const {notify, uuid, success, message} = JSON.parse(evt.data);

        if (notify) {
            if (Array.isArray(message)) {
                return workerLogger(...message);
            } else if (_.isString(message)) {
                return workerLogger(message);
            }

            return workerLogger(JSON.stringify(message));
        }

        if (!uuid || !_eventPool[uuid]) {
            return workerLogger('Invalid Worker Message = %s', evt.data);
        }

        if (success) {
            _eventPool[uuid].resolve(message);
        } else {
            workerLogger('Error = %s', JSON.stringify(evt.data));
            _eventPool[uuid].reject(message);
        }

        delete _eventPool[uuid];
    } catch (e) {
        workerLogger('Parse Worker Message Error = %s, raw = %s', e.message, evt.data);
    }
};

export const sendMessage = message => new Promise((resolve, reject) => {
    try {
        const uuid = getUuid();
        const data = JSON.stringify({uuid, message});

        _eventPool[uuid] = {resolve, reject};

        _worker.postMessage(data);
    } catch (ex) {
        reject(ex);
    }
});

