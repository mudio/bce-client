/**
 * MiddleWare - UploadQueue MiddleWare
 *
 * @file UploadQueue.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import async from 'async';
import {EventEmitter} from 'events';

import {UploadConfig} from '../config';
import {error, info} from '../utils/Logger';
import {getRegionClient} from '../api/client';
import {UploadStatus} from '../utils/TransferStatus';
import {UploadNotify} from '../utils/TransferNotify';

export default class UploadQueue extends EventEmitter {
    constructor(task) {
        super();

        // 保存任务
        this._task = task;
        // 设置事件触发器
        this.dispatch = window.globalStore.dispatch;
        // 起始状态必须为Waiting
        if (this._task.status !== UploadStatus.Waiting) {
            throw new Error(`Upload task = ${task.uuid} status must be Waiting!`);
        }

        // 初始化队列
        this._queue = async.queue(
            (...args) => this._upload(...args), UploadConfig.TaskLimit
        );
        // 事件绑定
        this._queue.empty = () => this.emit('empty');
        this._queue.drain = () => this.emit('drain');
        this._queue.error = () => this.emit('error');
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
        this.dispatch({type: UploadNotify.Launch, uuid: this._task.uuid});
    }

    // 通知任务状态变化
    _finally(err, metaKey, item) {
        const {uuid, region, bucket, prefix, name} = item;

        if (err) {
            error(
                'Failed Region = %s, Bucket = %s, Prefix = %s, Name = %s, Error = %s',
                region, bucket, prefix, prefix, name, err.message
            );
            // 通知任务有错误发生了
            this.dispatch({uuid, type: UploadNotify.Error, error: err.message});
        } else {
            info(
                'Finish Region = %s, Bucket = %s, Prefix = %s, Name = %s',
                region, bucket, prefix, prefix, name
            );
            // 完成任务
            this.dispatch({uuid, metaKey, type: UploadNotify.Finish});
        }
    }

    _decompose(uuid, region, bucket, object, metaFile) {
        const {uploadId, partNumberOffset, path, totalSize, offsetSize = 0} = metaFile;
        const parts = [];

        let leftSize = totalSize - offsetSize;
        let offset = offsetSize;
        let partNumber = partNumberOffset + 1;

        while (leftSize > 0) {
            const partSize = Math.min(leftSize, UploadConfig.PartSize);

            parts.push({uuid, uploadId, region, bucket, object, path, partNumber, partSize, start: offset});

            leftSize -= partSize;
            offset += partSize;
            partNumber += 1;
        }

        return parts;
    }

    _uploadPartFile(part, callback) {
        const {uuid, uploadId, region, bucket, object, path, partNumber, partSize, start} = part;
        const client = getRegionClient(region);

        info(
            'Start uuid = %s, PartNumber = %s, Part = %s',
            uuid, partNumber, JSON.stringify(part)
        );

        return client.uploadPartFromFile(
            bucket, object, uploadId,
            partNumber, partSize, path, start
        ).then(
            res => {
                const eTag = res.http_headers.etag;

                info(
                    'Finish Uuid = %s, PartNumber = %s, PartSize = %s eTag = %s',
                    uuid, partNumber, partSize, eTag
                );

                // 完成分片任务
                callback(null, {eTag, partNumber, partSize});

                // 通知分片进度
                this.dispatch({uuid, type: UploadNotify.Progress, increaseSize: partSize});
            },
            callback
        );
    }

    // 上传任务
    _upload(abstractTask, done) {
        const {uuid, region, bucket, prefix, metaKey} = abstractTask;
        const client = getRegionClient(region);

        let metaFile = null;

        try {
            metaFile = JSON.parse(localStorage.getItem(metaKey));
        } catch (ex) {
            done(ex);
        }

        const {path, relative, totalSize, offsetSize = 0} = metaFile;
        const object = prefix ? `/${prefix}${relative}` : relative;

        // 1. 判断上传大小，如果小于PartLimit *  PartSize 就别分片了
        if (totalSize - offsetSize <= UploadConfig.PartLimit * UploadConfig.PartSize) {
            // 上传完了交给最后的处理逻辑
            return client.putObjectFromFile(bucket, object, path).then(
                () => {
                    // 通知进度
                    this.dispatch({uuid, type: UploadNotify.Progress, increaseSize: totalSize});
                    // 保存结果
                    localStorage.setItem(metaKey, JSON.stringify(
                        Object.assign(metaFile, {finish: true})
                    ));
                    // 完成
                    done();
                },
                done
            );
        }

        // 2. 分片上传，初始化上传
        const workFlowPromise = new Promise((resolve, reject) => {
            if (metaFile.uploadId) {
                return client.listParts(bucket, object, metaFile.uploadId).then(
                    res => resolve({
                        uploadId: metaFile.uploadId,
                        parts: res.body.parts.sort(part => part.partNumber)
                    }),
                    reject
                );
            }
            return client.initiateMultipartUpload(bucket, object).then(
                res => resolve({uploadId: res.body.uploadId, parts: []}),
                reject
            );
        });

        workFlowPromise.then(
            (uploadId, parts) => {
                // 3. 保存metaFile信息, 分解任务
                const start = parts.reduce((total, part) => total + part.size, 0);
                const partNumberOffset = +start.slice(-1).partNumber;
                metaFile = object.assign(metaFile, {uploadId, partNumberOffset, offsetSize: start});
                const tasks = this._decompose(uuid, region, bucket, object, metaFile);

                async.mapLimit(
                    tasks, UploadConfig.PartLimit, this._uploadPartFile,
                    (err, allResponse = []) => {
                        // 统计已完成parts
                        const uploadedParts = _.compact(allResponse);

                        // 4. 如果没有错误，则完成上传
                        if (!err) {
                            const finishParts = [...parts, ...uploadedParts].map(
                                part => Object({partNumber: part.partNumber, eTag: part.ETag})
                            );
                            client.completeMultipartUpload(
                                bucket, object, uploadId, finishParts
                            ).then(
                                () => {
                                    metaFile.finish = true;
                                    localStorage.setItem(metaKey, JSON.stringify(metaFile));
                                    done();
                                },
                                _err => {
                                    localStorage.setItem(metaKey, JSON.stringify(metaFile));
                                    // 完成map
                                    done(_err);
                                }
                            );
                        } else {
                            metaFile.offsetSize = start + uploadedParts.reduce(
                                (total, item) => total + item.partSize, 0
                            );

                            localStorage.setItem(metaKey, JSON.stringify(metaFile));

                            done(err);
                        }
                        // 流程结束
                    }
                );
                // end mapLimit
            },
            done
        );
    }
}
