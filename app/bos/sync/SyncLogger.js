/**
 * Uitls - 同步盘日志记录器
 *
 * @file Logger.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import fs from 'fs';
import {remote} from 'electron';
import {notification} from 'antd';
import {getLogPath} from '../../utils';

export default class SyncLogger {
    constructor(name) {
        this.log = remote.getGlobal('log');
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

    clear() {
        fs.unlink(this.log.transports.file.file, err => {
            if (err) {
                notification.error({message: '清除日志失败', description: err.message});
            }
        });
    }
}
