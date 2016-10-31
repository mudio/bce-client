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

function startTask(uploadTasks = [], uploadIds = []) {
    let waitTasks = [];

    if (uploadIds.length === 0) {
        const leftWorker = UPLOAD_TASK_LIMIT - queue.running();
        waitTasks = uploadTasks.filter(task => task.status === TRANS_WATING).slice(0, leftWorker);
    } else {
        waitTasks = uploadTasks.filter(
            task => task.status === TRANS_WATING && uploadIds.indexOf(task.uploadId) > -1
        );
    }

    waitTasks.forEach(
        task => queue.push(task, err => {
            if (err) {
                logger('Finish UploadId = %s, Error = %s', task.uploadId, err.message);
                return eventEmiter({
                    error: err.message,
                    uploadId: task.uploadId,
                    type: UPLOAD_NOTIFY_ERROR
                });
            }

            logger('Finish UploadId = %s', task.uploadId);
            eventEmiter({type: UPLOAD_NOTIFY_FINISH, uploadId: task.uploadId});
        })
    );
}

function cancelTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

function suspendTask(uploadTasks = [], uploadIds = []) {
    return {uploadTasks, uploadIds};
}

export function upload(store) {
    return next => action => {
        const uploadTask = action[UPLOAD_TYPE];

        if (typeof uploadTask === 'undefined') {
            return next(action);
        }

        const {command, uploadIds} = uploadTask;
        const {uploads, auth} = store.getState();

        credentials.ak = auth.ak;
        credentials.sk = auth.sk;
        eventEmiter = message => next(message);

        next({type: command, uploadIds});

        switch (command) {
        case UPLOAD_COMMAND_START:
            return startTask(uploads, uploadIds);
        case UPLOAD_COMMAND_CANCEL:
            return cancelTask(uploads, uploadIds);
        case UPLOAD_COMMAND_SUSPEND:
            return suspendTask(uploads, uploadIds);
        default:
            throw new Error(`Not Expected Command: ${command}`);
        }
    };
}

// 任务分解
function decompose(task) {
    const {filePath, fileSize, uploadId, bucket, object} = task;
    const tasks = [];

    let leftSize = fileSize;
    let offset = 0;
    let partNumber = 1;

    while (leftSize > 0) {
        const partSize = Math.min(leftSize, UPLOAD_PART_SIZE);
        tasks.push({
            object,
            uploadId,
            partSize,
            partNumber,
            start: offset,
            file: filePath,
            bucketName: bucket
        });

        leftSize -= partSize;
        offset += partSize;
        partNumber += 1;
    }

    return tasks;
}

export function uploadFromFile(task, done) {
    const {bucket, object, uploadId, region} = task;
    const client = getRegionClient(region, credentials);

    // 如果少于UPLOAD_PART_LIMIT片，就别分了
    if (task.fileSize <= UPLOAD_PART_LIMIT * UPLOAD_PART_SIZE) {
        client.putObjectFromFile(task.bucket, object, task.filePath)
            .then(() => done(), done);
        return;
    }

    function uploadPartFile(part, callback) {
        logger('Start UploadId = %s, PartNumber = %s, Part = %s',
            uploadId, part.partNumber, JSON.stringify(part));

        return client.uploadPartFromFile(
            part.bucketName, part.object, part.uploadId,
            part.partNumber, part.partSize,
            part.file, part.start
        ).then(
            res => {
                logger('Finish UploadId = %s, PartNumber = %s, Part = %s',
                    uploadId, part.partNumber, JSON.stringify(part));
                // 通知分片进度
                eventEmiter({
                    type: UPLOAD_NOTIFY_PROGRESS,
                    uploadId: part.uploadId,
                    increaseSize: part.partSize,
                });
                // 完成分片任务
                callback(null, res);
            },
            err => callback(err)
        );
    }

    const deferred = Q.defer();
    const tasks = decompose(task);

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
}
