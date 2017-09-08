/**
 * 上传下载引导程序
 *
 * @export
 * @class Bootstrap
 */

import fs from 'fs';
import path from 'path';
import {EventEmitter} from 'events';
import childProcess from 'child_process';
import {UploadCommand, DownloadCommand} from 'bce-service-bos-transport';

import logger from '../../utils/logger';
import {getEndpointCredentials} from '../api/client';
import {
    DownloadNotify, DownloadCommandType,
    UploadNotify, UploadCommandType,
} from '../utils/TransferNotify';

class Bootstrap extends EventEmitter {
    constructor(filename) {
        super();

        this._filename = filename;
    }

    add(config) {
        const _instance = this._getInstance();
        const {endpoint} = getEndpointCredentials(config.region);

        _instance.send({category: 'addItem', config, endpoint});
    }

    remove(uuid) {
        if (this._process && this._process.connected) {
            this._process.send({category: 'pauseItem', config: {uuid}});
        }
    }

    pause(uuid) {
        if (this._process && this._process.connected) {
            this._process.send({category: 'pauseItem', config: {uuid}});
        }
    }

    _getInstance() {
        if (!this._process || !this._process.connected) {
            this._process = this._fork();

            this._process.on('exit', (...args) => this._onExit(...args));
            this._process.on('error', (...args) => this._onError(...args));
            this._process.on('message', (...args) => this._onMessage(...args));
        }

        return this._process;
    }

    _onError(err) {
        logger.error(`process ${this._process.pid} error ${err.message}`);
    }

    _onExit(code) {
        logger.warn(`process ${this._process.pid} exit ${code}`);
    }

    _handleDownloadCommand(message) {
        const command = message.command;

        switch (command) {
        case DownloadCommand.NotifyStart: {
            message.command = DownloadNotify.Start;
            break;
        }
        case DownloadCommand.NotifyPaused: {
            // 忽略这个事件
            return;
        }
        case DownloadCommand.NotifyFinished: {
            message.command = DownloadNotify.Finish;
            break;
        }
        case DownloadCommand.NotifyError: {
            message.command = DownloadNotify.Error;
            break;
        }
        case DownloadCommand.NotifyProgress: {
            message.command = DownloadNotify.Progress;
            break;
        }
        default:
            logger.warn(`Invalid transport command = ${command}`);
            return;
        }

        window.globalStore.dispatch({[DownloadCommandType]: message});
    }

    _handleUploadCommand(message) {
        const command = message.command;

        switch (command) {
        case UploadCommand.NotifyStart: {
            message.command = UploadNotify.Start;
            break;
        }
        case UploadCommand.NotifyFinished: {
            message.command = UploadNotify.Finish;
            break;
        }
        case UploadCommand.NotifyProgress: {
            message.command = UploadNotify.Progress;
            break;
        }
        case UploadCommand.NotifyPaused: {
            // 忽略这个事件
            return;
        }
        case UploadCommand.NotifyError: {
            message.command = UploadNotify.Error;
            break;
        }
        default:
            logger.warn(`Invalid transport command = ${command}`);
            return;
        }

        window.globalStore.dispatch({[UploadCommandType]: message});
    }

    _onMessage(body) {
        if (typeof body === 'string') {
            logger.debug(body);
        }
        if (typeof body === 'object') {
            const {category, message} = body;

            if (category === 'log') {
                logger[message.type](message.message);
            }

            if (category === 'cmd') {
                if (message.command.startsWith('download')) {
                    this._handleDownloadCommand(message);
                } else if (message.command.startsWith('upload')) {
                    this._handleUploadCommand(message);
                }
            }
        }
    }

    _fork() {
        const cwd = path.join(__dirname, '..');
        const {credentials} = getEndpointCredentials();

        const env = {
            BCE_AK: credentials.ak,
            BCE_SK: credentials.sk
        };

        if (fs.existsSync(path.join(cwd, 'app.asar'))) {
            return childProcess.fork(path.join('app.asar', this._filename), [], {cwd, env});
        }

        return childProcess.fork(
            path.join('../bce-service-bos-transport/dist/', this._filename), [], {env, cwd: process.cwd()}
        );
    }

    kill() {
        if (this._process || this._process.connected) {
            this._process.kill();
        }
    }
}

export const uploadProcesser = new Bootstrap('uploader.js');
export const downloadProcesser = new Bootstrap('downloader.js');

