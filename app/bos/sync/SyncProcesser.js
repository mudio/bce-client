/**
 * 同步盘上传处理程序
 *
 * @export
 * @class Bootstrap
 */

import u from 'underscore';
import fs from 'fs';
import path from 'path';
import async from 'async';
import watch from 'watch';
import childProcess from 'child_process';
import {walk, Settings} from '@nodelib/fs.walk';
import {EventEmitter} from 'events';
import {UploadCommand} from 'bce-service-bos-transport';
import {notification} from 'antd';

import SyncLogger from './SyncLogger';
import {getUuid} from '../../utils/helper';
import {ClientFactory} from '../api/client';

export default class SyncProcesser extends EventEmitter {
    constructor(task) {
        super();
        //  日志打印器
        this.logger = new SyncLogger(task.localPath);
        //  当前任务
        this._task = task;
        //  生成任务进程
        this._getInstance();
    }

    walkFolder() {
        const keymap = {};
        const {localPath: folder, records, prefix, bucketName} = this._task;

        walk(folder, new Settings({stats: true}), (err, entries) => {
            if (err) {
                this.logger.error(`读取文件夹错误：${err.message}`);
                return notification.error({message: '读取文件夹错误', description: err.message});
            }

            entries.forEach(file => {
                /**
                 * 1、文件夹不需要上传
                 * 2、通过对比本地文件修改时间和上传时间来确定本地文件是否变更
                 * 3、只上传远端没有的或者变更的文件
                 */
                if (!file.dirent.isDirectory()) {
                    const remote = u.find(records, item => {
                        const nativeKey = item.key.substring(prefix.length);
                        return `${folder}/${nativeKey}` === file.path;
                    });

                    if (!remote || (new Date(file.stats.mtime) > new Date(remote.lastModified))) {
                        keymap[file.path] = {size: file.stats.size, finish: false, uuid: getUuid()};
                    }
                }
            });

            this._task.keymap = keymap;

            async.eachLimit(Object.entries(keymap), 8, (item, callback) => {
                const [localPath, option] = item;
                const relativePath = path.relative(folder, localPath);
                const objectKey = path.posix.join(prefix, ...relativePath.split(path.sep));

                this.add({
                    uuid: option.uuid, bucketName, objectKey, localPath, uploadId: option.uploadId
                });

                setTimeout(callback, 30 * 1000);
            });
        });
    }

    watchFolder() {
        const {localPath: folder, bucketName, prefix, keymap = {}} = this._task;

        const callback = localPath => {
            const relativePath = path.relative(folder, localPath);
            const objectKey = path.posix.join(prefix, ...relativePath.split(path.sep));

            //  直接抛弃正在上传的相同文件
            //  没有的话就加进去
            if (keymap[localPath]) {
                this.remove(keymap[localPath].uuid);
                this.add({
                    uuid: keymap[localPath].uuid, bucketName, objectKey, localPath
                });
            } else {
                this._task.keymap[localPath] = {
                    uuid: getUuid(), bucketName, objectKey, localPath
                };
                this.add(this._task.keymap[localPath]);
            }
        };
        watch.createMonitor(folder, {ignoreDotFiles: true}, monitor => {
            monitor.on('created', f => monitor.files[f] === undefined && callback(f));
            monitor.on('changed', callback);
            this._monitor = monitor;
        });
    }

    async add(config) {
        const endpoint = await this._getEndpoint();
        this._process.send({category: 'addItem', config, endpoint});
    }

    remove(uuid) {
        if (this._process && this._process.connected) {
            this._process.send({category: 'removeItem', config: {uuid}});
        }
    }

    async _getEndpoint() {
        if (!this._endpoint) {
            const {endpoint} = await ClientFactory.produceCredentialsByBucket(this._task.bucketName);
            this._endpoint = endpoint;
        }
        return this._endpoint;
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
        this.logger.error(`process ${this._process.pid} error ${err.message}`);
    }

    _onExit(code) {
        this.logger.warn(`process ${this._process.pid} exit ${code}`);
    }

    _handleUploadCommand(message) {
        const {command} = message;
        const keyArray = Object.entries(this._task.keymap);
        const file = u.find(keyArray, item => item[1].uuid === message.uuid);

        switch (command) {
        case UploadCommand.NotifyStart: {
            this.logger.info(`[file=${file[0]}] start upload...`);
            break;
        }

        case UploadCommand.NotifyFinished: {
            this.emit('finish');
            this.logger.info(`[file=${file[0]}] upload has finished!`);
            break;
        }

        case UploadCommand.NotifyError: {
            this.logger.error(`[file=${file[0]}] upload error! reason: ${message.error}`);
            break;
        }

        default:
                //  其他事件直接忽略就好了
        }
    }

    _onMessage(body) {
        if (typeof body === 'string') {
            this.logger.debug(body);
        }
        if (typeof body === 'object') {
            const {category, message} = body;

            if (category === 'log') {
                this.logger[message.type](`[pid=${message.pid}] ${message.message}`);
            }

            if (category === 'cmd') {
                this._handleUploadCommand(message);
            }
        }
    }

    _fork() {
        const cwd = path.join(__dirname, '..');
        const {ak, sk} = ClientFactory.getCredentials();

        const env = {
            BCE_AK: ak,
            BCE_SK: sk
        };

        if (fs.existsSync(path.join(cwd, 'app.asar'))) {
            return childProcess.fork(path.join('app.asar', 'uploader.js'), [], {cwd, env});
        }

        return childProcess.fork(
            path.join('../bce-service-bos-transport/dist/', 'uploader'), [], {env, cwd: process.cwd()}
        );
    }

    kill() {
        if (this._process || this._process.connected) {
            this._process.kill();
            if (this._monitor) {
                this._monitor.stop();
            }
        }
    }

    clearLog() {
        this.logger.clear();
    }
}
