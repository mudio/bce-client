/**
 * Worker - Controller - 上传控制器
 *
 * @file Upload.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {UploadCommand} from '../../command';
import BaseController from './BaseController';
import {UploadStatus} from '../../../utils/TransferStatus';

export default class UploadController extends BaseController {
    [UploadCommand.Prepare](entity = {}) {
        /**
         * upload task model
         *  - id                    自增主键
         *  - name                  任务名称
         *  - type                  mutil or single
         *  - size                  任务大小
         *  - status                任务状态
         *  - region                地区
         *  - bucket                bucket
         *  - prefix                相对路径
         *  - tasks []
         *      - path              任务名称
         *      - size              任务大小
         *      - multipart         是否分片
         *      - uploadId          上传任务ID
         *      - parts []          分片集合
         *          - partNumber    片id
         *          - partSize      片大小
         *          - eTag          片md5
         *      - finish            是否完成
         */
        return this.getIdbAsync(
            db => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.schema.uploadTasks, 'readwrite');
                const uploadTaskStore = transaction.objectStore(this.schema.uploadTasks);

                let taskId = null;
                // 添加上传任务
                uploadTaskStore.add(
                    Object.assign({}, entity, {status: UploadStatus.Waiting})
                ).onsuccess = evt => (taskId = evt.target.result);

                transaction.oncomplete = () => resolve(taskId);
                transaction.onerror = reject;
                transaction.onblocked = reject;
            })
        );
    }

    [UploadCommand.Start](taskIds = []) {
        return this.getIdbAsync(
            db => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.schema.uploadTasks, 'readwrite');
                const objectStore = transaction.objectStore(this.schema.uploadTasks);
                const result = [];
                // 打开游标
                objectStore.openCursor().onsuccess = event => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (taskIds.indexOf(cursor.key) > -1
                            && cursor.value.status !== UploadStatus.Finish) {
                            const modifyData = Object.assign({}, cursor.value, {status: UploadStatus.Staring});
                            // 保存修改记录
                            result.push(modifyData);
                            // 修改状态
                            const req = objectStore.put(modifyData);
                            req.onsuccess = () => cursor.continue();
                            req.onerror = err => {
                                this.logger('Modify Data Error = %s', err.target.error.name);
                                cursor.continue();
                            };
                        } else {
                            cursor.continue();
                        }
                    }
                };

                transaction.oncomplete = () => resolve(result);
                transaction.onerror = reject;
                transaction.onblocked = reject;
            })
        );
    }

    [UploadCommand.SyncTask](data) {
        return this.getIdbAsync(
            db => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.schema.uploadTasks, 'readwrite');
                const objectStore = transaction.objectStore(this.schema.uploadTasks);

                let result = null;
                const {id, file} = data;
                // 打开游标
                objectStore.get(id).onsuccess = event => {
                    result = event.target.result;

                    result.fileInfos = result.fileInfos.map(item => {
                        if (item.path === file.path) {
                            return file;
                        }
                        return item;
                    });

                    objectStore.put(result);
                };

                transaction.oncomplete = () => resolve(result);
                transaction.onerror = reject;
                transaction.onblocked = reject;
            })
        );
    }

    [UploadCommand.Finish](data) {
        return this.getIdbAsync(
            db => new Promise((resolve, reject) => {
                const {id, path} = data;
                const transaction = db.transaction(this.schema.uploadTasks, 'readwrite');
                const objectStore = transaction.objectStore(this.schema.uploadTasks);
                let result = null;

                objectStore.get(id).onsuccess = evt => {
                    const record = evt.target.result;
                    let allFinish = true;

                    record.fileInfos = record.fileInfos.map(file => {
                        if (file.path === path) {
                            return Object.assign(file, {finish: true});
                        }

                        allFinish = allFinish && file.finish;

                        return file;
                    });

                    if (allFinish) {
                        record.status = UploadStatus.Finish;
                    } else {
                        record.status = UploadStatus.Running;
                    }

                    objectStore.put(record);

                    result = record;
                };

                transaction.oncomplete = () => resolve(result);
                transaction.onerror = reject;
                transaction.onblocked = reject;
            })
        );
    }

    [UploadCommand.FetchAll]() {
        return this.getIdbAsync(
            db => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.schema.uploadTasks);
                const objectStore = transaction.objectStore(this.schema.uploadTasks);
                let result = [];

                objectStore.getAll().onsuccess = event => {
                    result = event.target.result;
                };

                transaction.oncomplete = () => resolve(result);
                transaction.onerror = reject;
                transaction.onblocked = reject;
            })
        );
    }
}
