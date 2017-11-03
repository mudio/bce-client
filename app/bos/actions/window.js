/**
 * Action - Bucket Action & Creater
 *
 * @file bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';

import {info} from '../../utils/logger';
import {API_TYPE} from '../middleware/api';
import {ClientFactory, Client} from '../api/client';
import {uploadByDropFile, uploadBySelectPaths} from './uploader';

export const LIST_BUCKET_REQUEST = 'LIST_BUCKET_REQUEST';
export const LIST_BUCKET_SUCCESS = 'LIST_BUCKET_SUCCESS';
export const LIST_BUCKET_FAILURE = 'LIST_BUCKET_FAILURE';

export function listBuckets(region) {
    return {
        [API_TYPE]: {
            types: [LIST_BUCKET_REQUEST, LIST_BUCKET_SUCCESS, LIST_BUCKET_FAILURE],
            method: 'listBuckets',
            args: [{region}]
        }
    };
}


export const LIST_OBJECT_REQUEST = 'LIST_OBJECT_REQUEST';
export const LIST_OBJECT_SUCCESS = 'LIST_OBJECT_SUCCESS';
export const LIST_OBJECT_FAILURE = 'LIST_OBJECT_FAILURE';

export function listObjects(bucketName, prefix = '') {
    return {
        [API_TYPE]: {
            types: [LIST_OBJECT_REQUEST, LIST_OBJECT_SUCCESS, LIST_OBJECT_FAILURE],
            method: 'listObjects',
            args: [bucketName, {delimiter: '/', prefix, maxKeys: 1000}]
        }
    };
}

export const LIST_MORE_REQUEST = 'LIST_MORE_REQUEST';
export const LIST_MORE_SUCCESS = 'LIST_MORE_SUCCESS';
export const LIST_MORE_FAILURE = 'LIST_MORE_FAILURE';

export function listMoreObjects(bucketName, prefix = '', marker = '') {
    return {
        [API_TYPE]: {
            types: [LIST_MORE_REQUEST, LIST_MORE_SUCCESS, LIST_MORE_FAILURE],
            method: 'listObjects',
            args: [bucketName, {delimiter: '/', prefix, marker, maxKeys: 200}]
        }
    };
}

export const DELETE_OBJECT_REQUEST = 'DELETE_OBJECT_REQUEST';
export const DELETE_OBJECT_SUCCESS = 'DELETE_OBJECT_SUCCESS';
export const DELETE_OBJECT_FAILURE = 'DELETE_OBJECT_FAILURE';

export function deleteObject(region, bucketName, prefix, objects = []) {
    return dispatch => {
        const client = ClientFactory.fromRegion(region);

        const allTasks = objects.map(
            key => client.listAllObjects(bucketName, key).then(
                keys => {
                    const removeKeys = keys.map(item => item.key);
                    info(
                        'Delete bucketName = %s, prefix = %s, keys = %s',
                        bucketName, prefix, removeKeys
                    );

                    const deferred = dispatch({
                        [API_TYPE]: {
                            types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                            method: 'deleteAllObjects',
                            args: [bucketName, removeKeys]
                        }
                    });

                    return deferred;
                },
                error => dispatch({
                    error,
                    type: DELETE_OBJECT_FAILURE
                })
            )
        );

        return Q.allSettled(allTasks).finally(
            () => dispatch(listObjects(bucketName, prefix))
        );
    };
}

export function uploadByDrop(...args) {
    return uploadByDropFile(...args);
}

export function uploadBySelect(...args) {
    return uploadBySelectPaths(...args);
}

export function listMore(...args) {
    return listMoreObjects(...args);
}

export const COPY_OBJECT_REQUEST = 'COPY_OBJECT_REQUEST';
export const COPY_OBJECT_SUCCESS = 'COPY_OBJECT_SUCCESS';
export const COPY_OBJECT_FAILURE = 'COPY_OBJECT_FAILURE';

/*
 * 1. 请求者必须对源Object有读操作权限。
 * 2. 在计算签名之前，用户需要针对x-bce-copy-source字段中为非标准ASCII字符（例如：中文）的内容做一次url-encode。
 * 3. 为了保持复制过程中的http连接，CopyObject接口的http结果可能使用Transfer-Encoded: Chunked编码方式。
 * 4. CopyObject过程中，如果发生服务器端错误，http status code可能返回2XX但是复制失败，复制结果请根据http body中的json判定。
* */
export function copyObject(sourceBucketName, sourceKey, targetBucketName, targetKey, options) {
    return {
        [API_TYPE]: {
            types: [COPY_OBJECT_REQUEST, COPY_OBJECT_SUCCESS, COPY_OBJECT_FAILURE],
            method: 'copyObject',
            args: [sourceBucketName, sourceKey, targetBucketName, targetKey, options]
        }
    };
}

export function migrationObject(config, removeSource = false) {
    return dispatch => {
        const {sourceBucket, sourceObject, targetBucket, targetObject} = config;

        return Client.fromBucket(targetBucket).then(
            // 查询所有内容，先复制
            client => client.listAllObjects(sourceBucket, sourceObject).then(objects => {
                const promises = objects.map(item => {
                    const targetKey = item.key.replace(sourceObject, targetObject);

                    return dispatch(
                        copyObject(sourceBucket, item.key, targetBucket, targetKey)
                    ).then(
                        res => {
                            // 如有etag就认为成功了
                            if (res.response.body.eTag) {
                                return item.key;
                            }

                            return Promise.reject(res.response.body);
                        }
                    );
                });

                return Q.allSettled(promises).then(results => {
                    const errorQueue = results.filter(item => item.state !== 'fulfilled');
                    const successQueue = results.filter(item => item.state === 'fulfilled');

                    return {errorQueue, successQueue};
                });
            // 处理是否删除源文件逻辑
            }).then(result => {
                const {errorQueue, successQueue} = result;
                if (removeSource) {
                    const removeKeys = successQueue.map(item => item.value);
                    return dispatch({
                        [API_TYPE]: {
                            types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                            method: 'deleteAllObjects',
                            args: [sourceBucket, removeKeys]
                        }
                    }).then(
                        ({response}) => ({
                            successCount: response.filter(item => item.state === 'fulfilled').length,
                            errorCount: response.filter(item => item.state !== 'fulfilled').length
                        })
                    );
                }

                return {
                    successCount: successQueue.length,
                    errorCount: errorQueue.length
                };
            }).finally(() => {
                // 刷新
                const prefix = sourceObject.endsWith('/')
                    ? sourceObject.replace(/^(.*\/)?(.*)\/$/g, '$1')
                    : sourceObject.replace(/^(.*\/)?(.*)$/g, '$1');
                dispatch(listObjects(sourceBucket, prefix));
            })
        );
    };
}
