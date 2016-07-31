/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import {REGION_BJ, REGION_GZ} from '../utils/Region';
import {BosClient} from 'bce-sdk-js';

const endpoint = {
    [REGION_BJ]: 'http://bos.qasandbox.bcetest.baidu.com',
    [REGION_GZ]: 'http://bos.gz.qasandbox.bcetest.baidu.com'
};

class Client extends BosClient {
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
}

export function getRegionClient(region, auth) {
    if (region) {
        return new Client(region, auth);
    }

    throw new Error('Not found region client.');
}
