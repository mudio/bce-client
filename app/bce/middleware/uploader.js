/**
 * MiddleWare - Upload MiddleWare
 *
 * @file uploader.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';
import debug from 'debug';
import async from 'async';
import {TRANS_WATING} from '../utils/TransferStatus';
import {getRegionClient} from '../api/client';

export const UPLOAD_TYPE = Symbol('Upload File');
export const UPLOAD_TASK_LIMIT = 5; // 最多跑五个任务
export const UPLOAD_PART_LIMIT = 2; // 每个任务最多分2片
export const UPLOAD_RATE_LIMIT = 200; // kb/s 暂不支持
export const UPLOAD_PART_SIZE = 5 * 1024 * 1024; // 5MB

export const UPLOAD_COMMAND_START = 'TRANS_UPLOAD_START'; // 开始任务
export const UPLOAD_COMMAND_CANCEL = 'TRANS_UPLOAD_CANCEL'; // 取消任务
export const UPLOAD_COMMAND_SUSPEND = 'TRANS_UPLOAD_SUSPEND'; // 挂起任务
export const UPLOAD_NOTIFY_PROGRESS = 'TRANS_UPLOAD_PROGRESS'; // 任务进度通知
export const UPLOAD_NOTIFY_FINISH = 'UPLOAD_NOTIFY_FINISH'; // 任务完成了
export const UPLOAD_NOTIFY_ERROR = 'UPLOAD_NOTIFY_ERROR'; // 错误

const credentials = {};
const logger = debug('bce-client:upload');
let eventEmiter = noop => noop;

const queue = async.queue(
    (task, callback) => uploadFromFile(task, callback),
    UPLOAD_TASK_LIMIT
);

function startTask(uploadTasks = [], uuids = []) {
    let waitTasks = [];

    if (uuids.length === 0) {
        const leftWorker = UPLOAD_TASK_LIMIT - queue.running();
        waitTasks = uploadTasks.filter(task => task.status === TRANS_WATING).slice(0, leftWorker);
    } else {
        waitTasks = uploadTasks.filter(
            task => task.status === TRANS_WATING && uuids.indexOf(task.uuid) > -1
        );
    }

    waitTasks.forEach(
        task => queue.push(task, err => {
            if (err) {
                logger(
                    'Failed Region = %s, Bucket = %s, Object = %s, Error = %s',
                     task.region, task.bucket, task.object, err.message
                );
                return eventEmiter({
                    uuid: task.uuid,
                    error: err.message,
                    type: UPLOAD_NOTIFY_ERROR
                });
            }

            logger(
                'Finish Region = %s, Bucket = %s, Object = %s',
                task.region, task.bucket, task.object
            );
            eventEmiter({type: UPLOAD_NOTIFY_FINISH, uuid: task.uuid});
        })
    );
}

function cancelTask(uploadTasks = [], objects = []) {
    return {uploadTasks, objects};
}

function suspendTask(uploadTasks = [], objects = []) {
    return {uploadTasks, objects};
}

export function upload(store) {
    return next => action => {
        const uploadTask = action[UPLOAD_TYPE];

        if (typeof uploadTask === 'undefined') {
            return next(action);
        }

        const {command, uuids} = uploadTask;
        const {uploads, auth} = store.getState();

        credentials.ak = auth.ak;
        credentials.sk = auth.sk;
        eventEmiter = message => next(message);

        next({type: command, uuids});

        switch (command) {
        case UPLOAD_COMMAND_START:
            return startTask(uploads, uuids);
        case UPLOAD_COMMAND_CANCEL:
            return cancelTask(uploads, uuids);
        case UPLOAD_COMMAND_SUSPEND:
            return suspendTask(uploads, uuids);
        default:
            throw new Error(`Not Expected Command: ${command}`);
        }
    };
}

// 任务分解
function decompose(task, uploadId) {
    const {uuid, bucket, object, filePath, fileSize} = task;
    const tasks = [];

    let leftSize = fileSize;
    let offset = 0;
    let partNumber = 1;

    while (leftSize > 0) {
        const partSize = Math.min(leftSize, UPLOAD_PART_SIZE);
        tasks.push({
            uuid,
            uploadId,
            bucket,
            object,
            partSize,
            partNumber,
            filePath,
            start: offset
        });

        leftSize -= partSize;
        offset += partSize;
        partNumber += 1;
    }

    return tasks;
}

export function uploadFromFile(task, done) {
    const {uuid, region, bucket, object, filePath, fileSize} = task;
    const client = getRegionClient(region, credentials);

    // 如果少于UPLOAD_PART_LIMIT片，就别分了
    if (fileSize <= UPLOAD_PART_LIMIT * UPLOAD_PART_SIZE) {
        client.putObjectFromFile(bucket, object, filePath)
            .then(() => done(), done);
        return;
    }

    function uploadPartFile(part, callback) {
        logger(
            'Start Uuid = %s, UploadId = %s, PartNumber = %s, Part = %s',
            uuid, part.uploadId, part.partNumber, JSON.stringify(part)
        );

        return client.uploadPartFromFile(
            part.bucket, part.object, part.uploadId,
            part.partNumber, part.partSize,
            part.filePath, part.start
        ).then(
            res => {
                logger('Finish Uuid = %s, UploadId = %s, PartNumber = %s, Part = %s',
                    uuid, part.uploadId, part.partNumber, JSON.stringify(part));
                // 通知分片进度
                eventEmiter({
                    uuid: part.uuid,
                    increaseSize: part.partSize,
                    type: UPLOAD_NOTIFY_PROGRESS
                });
                // 完成分片任务
                callback(null, res);
            },
            err => callback(err)
        );
    }

    // 分片之前先创建一个uploadId
    client.initiateMultipartUpload(bucket, object).then(
        res => {
            const uploadId = res.body.uploadId;

            const deferred = Q.defer();
            const tasks = decompose(task, uploadId);

            async.mapLimit(
                tasks, UPLOAD_PART_LIMIT,
                uploadPartFile,
                (err, results) => (err ? deferred.reject(err) : deferred.resolve(results))
            );

            deferred.promise.then(
                allResponse => {
                    const partList = allResponse.map((response, index) => ({
                        partNumber: index + 1,
                        eTag: response.http_headers.etag
                    }));

                    return client.completeMultipartUpload(bucket, object, uploadId, partList); // 完成上传
                },
                done
            ).then(
                () => done(), done
            );
        },
        response => done(response.body)
    );
}
