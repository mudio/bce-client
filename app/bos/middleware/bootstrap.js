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
import {DownloadCommand} from 'bce-service-bos-transport';

import logger from '../../utils/logger';
import {getEndpointCredentials} from '../api/client';
import {DownloadNotify, DownloadCommandType} from '../utils/TransferNotify';

class Bootstrap extends EventEmitter {
    constructor(filename) {
        super();

        this._filename = filename;
    }

    add(config) {
        const _instance = this._getInstance();
        _instance.send({category: 'addItem', config});
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

    _onError() {
        logger.error('error');
    }

    _onExit() {
        logger.warn('exit');
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

            if (category === 'cmd' && message.command.startsWith('download')) {
                const command = message.command;

                switch (command) {
                case DownloadCommand.NotifyStart: {
                    message.command = DownloadNotify.Start;
                    break;
                }
                case DownloadCommand.NotifyPaused: {
                    message.command = DownloadNotify.Paused;
                    break;
                }
                case DownloadCommand.NotifyFinished: {
                    message.command = DownloadNotify.Finish;
                    break;
                }
                case DownloadCommand.NotifyError: {
                    message.command = DownloadNotify.Error;
                    break;
                }
                case DownloadCommand.NotifyRate: {
                    message.command = DownloadNotify.Progress;
                    break;
                }
                default:
                    return;
                }

                window.globalStore.dispatch({[DownloadCommandType]: message});
            }
        }
    }

    _fork() {
        const cwd = path.join(__dirname, '..');
        const {endpoint, credentials} = getEndpointCredentials();

        const env = {
            BCE_AK: credentials.ak,
            BCE_SK: credentials.sk,
            BCE_BOS_ENDPOINT: endpoint
        };

        if (fs.existsSync(path.join(cwd, 'app.asar'))) {
            return childProcess.fork(path.join('app.asar', this._filename), [], {cwd, env});
        }

        return childProcess.fork(
            path.join('../bce-service-bos-transport/dist/', this._filename), [], {env, cwd: process.cwd()}
        );
    }
}

export const uploadProcesser = new Bootstrap('uploader.js');
export const downloadProcesser = new Bootstrap('downloader.js');

