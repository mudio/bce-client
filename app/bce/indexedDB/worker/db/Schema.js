/**
 * Worker - Schema - 统一管理数据库Schema
 *
 * @file Schema.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import DB from './DB';

const kSchemaVersion = 1;

export default class Schema extends DB {
    constructor(dbName = 'bce_bos') {
        super(dbName, kSchemaVersion);

        this._schemaVerison = kSchemaVersion;
        this.schema = {
            uploadTasks: 'uploadTasks'
        };
    }

    onUpgradeNeeded(evt) {
        super.onUpgradeNeeded(evt);

        const db = evt.target.result;
        const {uploadTasks} = this.schema;

        if (evt.oldVersion < 1) {
            /**
             * upload task model
             *  - id                    自增主键
             *  - name                  任务名称
             *  - category              file / directory
             *  - totalSize             总任务大小
             *  - status                任务状态
             *  - region                地区
             *  - bucket                bucket
             *  - prefix                bos绝对路径
             *  - fileInfos []
             *      - relative          bos相对路径
             *      - path              文件路径
             *      - totalSize         任务大小
             *      - offsetSize        已上传大小
             *      - uploadId          上传任务ID   // option
             *      - parts             分片集合     // option
             *          - partNumber    片id
             *          - eTag          片md5
             *      - finish            是否完成
             */
            const uploadTasksStore = db.createObjectStore(uploadTasks, {keyPath: 'id', autoIncrement: true});
            uploadTasksStore.createIndex('status', 'status', {unique: false});

            this.logger('Database %s create schema %s with indexs = status!', this._dbName, uploadTasks);
        }
    }
}
