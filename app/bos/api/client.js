/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import Q from 'q';
import {BosClient} from 'bce-sdk-js';

import {REGION_BJ} from '../../utils/region';
import GlobalConfig from '../../main/ConfigManager';

const endpoint = GlobalConfig.get('endpoint');

export class Client extends BosClient {
    constructor(region, credentials) {
        super({credentials, endpoint: endpoint[region]});
        this.region = region;
        this.credentials = credentials;
    }

    listBuckets(config = {}) {
        const {forceUpdate, region} = config;

        if (!forceUpdate) {
            try {
                const {buckets, owner} = JSON.parse(sessionStorage.getItem('buckets'));

                if (region) {
                    return Promise.resolve({
                        owner,
                        buckets: buckets.filter(item => item.location === region)
                    });
                }

                return Promise.resolve({owner, buckets});
            } catch (ex) {} // eslint-disable-line
        }

        return super.listBuckets().then(res => {
            const {buckets, owner} = res.body;

            try {
                sessionStorage.setItem('buckets', JSON.stringify(res.body));
            } catch (ex) {} // eslint-disable-line

            if (region) {
                return {
                    owner,
                    buckets: buckets.filter(item => item.location === region)
                };
            }

            return {owner, buckets};
        });
    }

    static fromBucket(bucketName) {
        const credentials = JSON.parse(localStorage.getItem('framework')).auth;
        const client = new Client(REGION_BJ, credentials);

        return client.listBuckets().then(res => {
            const bucket = res.buckets.find(item => item.name === bucketName);

            if (bucket) {
                return new Client(bucket.location, credentials);
            }

            // 默认返回北京
            return client;
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
    const {ak, sk} = JSON.parse(localStorage.getItem('framework')).auth;
    return new Client(region, {ak, sk});
}

export function getEndpointCredentials(region = REGION_BJ) {
    const credentials = JSON.parse(localStorage.getItem('framework')).auth;
    return {credentials, endpoint: endpoint[region]};
}
