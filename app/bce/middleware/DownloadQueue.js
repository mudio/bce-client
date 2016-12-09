/**
 * MiddleWare - DownloadQueue MiddleWare
 *
 * @file DownloadQueue.js
 * @author mudio(job.mudio@gmail.com)
 */

import fs from 'fs';
import path from 'path';
import async from 'async';
import mkdirp from 'mkdirp';
import {EventEmitter} from 'events';

import {DownloadConfig} from '../config';
import {error, info} from '../utils/Logger';
import {getRegionClient} from '../api/client';
import {DownloadStatus} from '../utils/TransferStatus';
import {DownloadNotify} from '../utils/TransferNotify';

export default class DownloadQueue extends EventEmitter {
    static TaskProperties = [
        'uuid', 'name', 'basedir', 'region', 'bucket', 'prefix', 'status', 'totalSize',
        'waitingQueue', 'errorQueue', 'completeQueue'
    ];

    static MetaProperties = [
        'relative', 'offsetSize', 'totalSize', 'finish'
    ];

    constructor(task) {
        super();

        // 检查任务
        if (!this._checkProperties(task, DownloadQueue.TaskProperties)) {
            throw new TypeError(`Task ${task.uuid} must has properties: ${DownloadQueue.TaskProperty.join('、')}`);
        }
        // 设置挂起状态
        this._suspend = false;
        // 保存任务
        this._task = task;
        // 设置事件触发器
        this.dispatch = window.globalStore.dispatch;
        // 起始状态必须为Waiting
        if (this._task.status !== DownloadStatus.Waiting
            && this._task.status !== DownloadStatus.Error
            && this._task.status !== DownloadStatus.Suspended) {
            throw new TypeError(`Download Task = ${task.uuid} status must be Waiting!`);
        }

        // 初始化队列
        this._queue = async.queue(
            (...args) => this._download(...args), DownloadConfig.MetaLimit
        );
        // 事件绑定
        this._queue.empty = () => this.emit('empty');
        this._queue.drain = () => this.emit('drain');
        this._queue.error = err => this._error(err);
        this._queue.saturated = () => this.emit('saturated');
        this._queue.unsaturated = () => this.emit('unsaturated');
        // 等待任务放入队列中
        task.waitingQueue.forEach(
            metaKey => this._queue.push(
                {metaKey, ...task},
                err => this._finally(err, metaKey, task)
            )
        );
        // 错误任务放入队列中
        task.errorQueue.forEach(
            metaKey => this._queue.push(
                {metaKey, ...task},
                err => this._finally(err, metaKey, task)
            )
        );
        // 通知任务开始，状态设置为Running
        this.dispatch({type: DownloadNotify.Launch, uuid: this._task.uuid});
    }

    // 属性检查，属性太多代码写着写着就忘记了
    _checkProperties(task, properties = []) {
        return properties.reduce(
            (hasProperty, property) => hasProperty && (property in task),
            true
        );
    }

    // 通知任务状态变化
    _finally(err, metaKey, item) {
        const {uuid, region, bucket, prefix, name} = item;

        if (err) {
            error(
                'Download failed Uuid = %s, Name = %s, Region = %s, Bucket = %s, Prefix = %s, Error = %s',
                uuid, name, region, bucket, prefix, err.message
            );
            // 通知任务有错误发生了
            this.dispatch({uuid, metaKey, type: DownloadNotify.Error, error: err.message});
        } else {
            info(
                'Download finish Uuid = %s, Name = %s, Region = %s, Bucket = %s, Prefix = %s',
                uuid, name, region, bucket, prefix
            );
            // 完成任务
            this.dispatch({uuid, metaKey, type: DownloadNotify.Finish});
        }

        this._checkPaused();
    }

    _downloadFile(uuid, region, bucket, object, localDir, position) {
        const {totalSize} = position;
        const client = getRegionClient(region);

        const _promise = new Promise((resolve, reject) => {
            fs.stat(localDir, (err, stat) => {
                let size = 0;
                let option = {};

                if (err && err.code !== 'ENOENT') {
                    return reject(err);
                }

                if (stat) {
                    option = {flags: 'a'};
                    size = stat.size;
                }

                // 阻止对asar文件进行处理
                process.noAsar = true;
                const outputStream = fs.createWriteStream(localDir, option);
                process.noAsar = false;

                return resolve({outputStream, start: size});
            });
        });

        return _promise.then(stat => new Promise(
            (resolve, reject) => {
                const {outputStream, start} = stat;
                const ranges = [];
                let offset = start;
                let leftSize = totalSize - start;

                while (leftSize > 0) {
                    const partSize = Math.min(leftSize, DownloadConfig.PartSize);

                    ranges.push(`${offset}-${offset + partSize - 1}`); // eslint-disable-line no-mixed-operators

                    leftSize -= partSize;
                    offset += partSize;
                }

                // 同步下载
                async.mapSeries(ranges, (range, callback) => {
                    client.getObject(bucket, object, range).then(
                        res => outputStream.write(res.body, err => {
                            if (!err) {
                                // 显示调试信息
                                info('Task uuid = %s range = %s bufferSize = %s', uuid, range, res.body.length);
                                // 通知进度
                                this.dispatch({uuid, increaseSize: res.body.length, type: DownloadNotify.Progress});
                                // 完成map
                                if (this._suspend) {
                                    callback(new Error('Download Task Suspend!'));
                                } else {
                                    callback(null, res.body.length);
                                }
                            } else {
                                callback(err);
                            }
                        }),
                        callback
                    );
                }, err => {
                    outputStream.end();

                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        ));
    }

    _mkdir(dirName) {
        return new Promise((resolve, reject) => {
            fs.stat(dirName, (err) => {
                if (err && err.code !== 'ENOENT') {
                    reject(err);
                }

                mkdirp(dirName, _err => {
                    if (_err) {
                        reject(_err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    // 下载任务
    _download(abstractTask, done) {
        const {uuid, basedir, region, bucket, prefix, metaKey} = abstractTask;

        let metaFile = null;

        try {
            metaFile = JSON.parse(localStorage.getItem(metaKey));

            if (!this._checkProperties(metaFile, DownloadQueue.MetaProperties)) {
                throw new TypeError(
                    `MetaFile ${metaFile.uuid} must has properties: ${DownloadQueue.MetaProperty.join('、')}`
                );
            }
        } catch (ex) {
            done(ex);
        }

        const {relative, totalSize, offsetSize = 0} = metaFile;
        const object = prefix ? `/${prefix}${relative}` : relative;
        const localPath = path.join(basedir, relative);
        const localDir = path.dirname(localPath);
        // 1. 创建下载路径
        this._mkdir(localDir).then(
            // 2. 上传
            () => this._downloadFile(
                uuid, region, bucket, object, localPath, {start: offsetSize, totalSize}
            )
        ).then(() => done(), done);
    }

    _error(err) {
        error('Download Error = %s', err.message);
    }

    _checkPaused() {
        const {uuid} = this._task;

        if (this._suspend && this._queue.idle()) {
            this.emit('suspend');
            // 任务已暂停
            this.dispatch({taskId: uuid, type: DownloadNotify.Suspended});
        }
    }

    // 挂起任务
    suspend() {
        this._suspend = true;
        // 暂停队列，不在提交新任务
        this._queue.kill();
    }
}
