/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';
import {BosClient} from 'bce-sdk-js';

import {REGION_BJ} from '../utils/Region';
import GlobalConfig from '../../main/ConfigManager';

const endpoint = GlobalConfig.get('endpoint');

export class Client extends BosClient {
    constructor(region, auth) {
        super({credentials: auth, endpoint: endpoint[region]});
        this.region = region;
    }

    listBuckets() {
        return super.listBuckets().then(res => {
            // 按照地域过滤
            const buckets = res.body.buckets.filter(item => item.location === this.region);
            return Object.assign(res.body, {buckets});
        });
    }

    listObjects(...args) {
        return super.listObjects(...args).then(res => {
            const folders = res.body.commonPrefixes.map(item => Object.assign({}, {key: item.prefix}));
            const objects = res.body.contents.filter(item => item.key !== res.body.prefix);

            delete res.body.commonPrefixes; // eslint-disable-line no-param-reassign
            delete res.body.contents; // eslint-disable-line no-param-reassign

            return {
                ...res.body,
                folders,
                objects,
            };
        });
    }

    listRawObjects(...args) {
        return super.listObjects(...args);
    }

    listAllObjects(bucketName, prefix) {
        let objects = [];
        const deferred = Q.defer();

        const fetchObjects = marker => {
            this.listRawObjects(bucketName, {prefix, marker}).then(
                res => {
                    const {isTruncated, contents, nextMarker} = res.body;
                    // const keys = contents.filter(item => !item.key.endsWith('/'));
                    objects = [...objects, ...contents];

                    if (isTruncated) {
                        fetchObjects(nextMarker);
                    } else {
                        deferred.resolve(objects);
                    }
                },
                err => deferred.reject(err)
            );
        };

        fetchObjects();

        return deferred.promise;
    }


    deleteAllObjects(bucketName, keys = []) {
        const taskQueues = [];

        while (keys.length > 0) {
            const deferred = this.deleteMultipleObjects(bucketName, keys.splice(0, 1000));
            taskQueues.push(deferred);
        }

        return Q.allSettled(taskQueues);
    }

    uploadPartFromFile(...args) {
        // electron 对asar文件处理特殊处理，这里屏蔽下
        process.noAsar = true;
        const deferred = super.uploadPartFromFile(...args);
        process.noAsar = false;

        return deferred;
    }
}

export function getRegionClient(region = REGION_BJ) {
    const {auth} = window.globalStore.getState();
    const {ak, sk} = auth;

    if (region) {
        return new Client(region, {ak, sk});
    }

    throw new Error('Not found region.');
}
