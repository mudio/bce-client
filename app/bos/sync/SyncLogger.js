/**
 * Uitls - 同步盘日志记录器
 *
 * @file Logger.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import {remote} from 'electron';
import {getLogPath} from '../../utils';

export default class SyncLogger {
    constructor(name) {
        this.log = remote.require('electron-log');
        this.log.transports.file.level = 'info';
        this.log.transports.console.level = 'debug';
        this.log.transports.file.maxSize = 100 * 1024 * 1024;
        this.log.transports.file.file = getLogPath(name);

        this._init();
    }

    _init() {
        const methods = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        methods.forEach(type => {
            this[type] = this.log[type];
        });
    }

    getInstance() {
        return this.log;
    }
}
