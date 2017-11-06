/**
 * Action - Bucket Action & Creater
 *
 * @file bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import {info} from '../../utils/logger';
import {API_TYPE} from '../middleware/api';
import {ClientFactory} from '../api/client';

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

export function deleteObject(bucketName, prefix, objects = []) {
    return async dispatch => {
        const client = await ClientFactory.fromBucket(bucketName);

        const allTasks = objects.map(async key => {
            try {
                const keys = await client.listAllObjects(bucketName, key);

                const removeKeys = keys.map(item => item.key);
                info(
                    'Delete bucketName = %s, prefix = %s, keys = %s',
                    bucketName, prefix, removeKeys
                );

                const deferred = await dispatch({
                    [API_TYPE]: {
                        types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                        method: 'deleteAllObjects',
                        args: [bucketName, removeKeys]
                    }
                });

                return deferred;
            } catch (error) {
                dispatch({type: DELETE_OBJECT_FAILURE, error});
            }
        });

        return Promise.all(allTasks).then(
            () => dispatch(listObjects(bucketName, prefix))
        );
    };
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
    return async dispatch => {
        const region = await ClientFactory.produceRegionByBucket(targetBucketName);

        return dispatch({
            [API_TYPE]: {
                region,
                types: [COPY_OBJECT_REQUEST, COPY_OBJECT_SUCCESS, COPY_OBJECT_FAILURE],
                method: 'copyObject',
                args: [sourceBucketName, sourceKey, targetBucketName, targetKey, options]
            }
        });
    };
}

export function migrationObject(config, removeSource = false) {
    return async dispatch => {
        const {sourceBucket, sourceObject, targetBucket, targetObject} = config;
        // 获取Client
        const client = await ClientFactory.fromBucket(sourceBucket);
        // 查询所有内容，先复制
        const objects = await client.listAllObjects(sourceBucket, sourceObject);
        const copyTasks = objects.map(item => {
            const targetKey = item.key.replace(sourceObject, targetObject);

            return dispatch(
                copyObject(sourceBucket, item.key, targetBucket, targetKey)
            ).then(res => {
                const {error, response} = res;

                if (error) {
                    return Promise.reject(error);
                }

                // 如有etag就认为成功了
                if (response.body.eTag) {
                    return item.key;
                }
            });
        });

        try {
            const removeKeys = await Promise.all(copyTasks);

            // 处理是否删除源文件逻辑
            if (removeSource) {
                await dispatch({
                    [API_TYPE]: {
                        types: [DELETE_OBJECT_REQUEST, DELETE_OBJECT_SUCCESS, DELETE_OBJECT_FAILURE],
                        method: 'deleteAllObjects',
                        args: [sourceBucket, removeKeys]
                    }
                });
            }

            // 刷新
            const prefix = sourceObject.endsWith('/')
                ? sourceObject.replace(/^(.*\/)?(.*)\/$/g, '$1')
                : sourceObject.replace(/^(.*\/)?(.*)$/g, '$1');
            await dispatch(listObjects(sourceBucket, prefix));
        } catch (ex) {
            return Promise.reject(ex);
        }
    };
}
