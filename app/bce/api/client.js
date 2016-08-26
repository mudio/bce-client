/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import {BosClient} from 'bce-sdk-js';
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
            return Object.assign(res.body, {buckets, folders: [], objects: []});
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
                buckets: [],
                folders,
                objects,
            };
        });
    }

    listRawObjects(...args) {
        return super.listObjects(...args);
    }

    deleteMultipleObjects(bucketName, objects, options = {}) {
        // bce-sdk-js v0.1.8 api参数有问题，这里重写下
        return this.sendRequest('POST', {
            bucketName,
            params: {delete: ''},
            body: JSON.stringify({
                objects: objects.map(key => ({key}))
            }),
            config: options.config
        });
    }

    uploadPartFromFile(...args) {
        // electron 对asar文件处理特殊处理，这里屏蔽下
        process.noAsar = true;
        const deferred = super.uploadPartFromFile(...args);
        process.noAsar = false;

        return deferred;
    }
}

export function getRegionClient(region, auth) {
    if (region) {
        return new Client(region, auth);
    }

    throw new Error('Not found region client.');
}
