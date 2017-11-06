/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import {BosClient} from 'bce-sdk-js';

import {REGION_BJ} from '../../utils/region';
import GlobalConfig from '../../main/ConfigManager';

const kEndpointMap = GlobalConfig.get('endpoint');

export class Client extends BosClient {
    constructor(region, credentials) {
        super({credentials, endpoint: kEndpointMap[region]});
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

        const fetchObjects = marker => this.listRawObjects(bucketName, {prefix, marker})
            .then(
                res => {
                    const {isTruncated, contents, nextMarker} = res.body;
                    // const keys = contents.filter(item => !item.key.endsWith('/'));
                    objects = [...objects, ...contents];

                    if (isTruncated) {
                        return fetchObjects(nextMarker);
                    }

                    return Promise.resolve(objects);
                },
                err => Promise.reject(err)
            );


        return fetchObjects();
    }


    deleteAllObjects(bucketName, keys = []) {
        const taskQueues = [];

        while (keys.length > 0) {
            const deferred = this.deleteMultipleObjects(bucketName, keys.splice(0, 1000));
            taskQueues.push(deferred);
        }

        return Promise.all(taskQueues);
    }

    uploadPartFromFile(...args) {
        // electron 对asar文件处理特殊处理，这里屏蔽下
        process.noAsar = true;
        const deferred = super.uploadPartFromFile(...args);
        process.noAsar = false;

        return deferred;
    }

    /**
     * 获取图片缩略图
     *
     * @param {any} bucket
     * @param {any} object
     * @param {any} eTag `getObject` 没有返回Etag
     *
     * @memberOf Client
     */
    getThumbnail(bucket, object, eTag) {
        // const tmpDir = fs.realpathSync(os.tmpdir());
        // const clientTmpDir = path.join(tmpDir, 'com.baidu.bce.client');
        // const filePath = path.join(clientTmpDir, eTag);

        const data = sessionStorage.getItem(eTag);
        if (data) {
            return Promise.resolve(data);
        }

        // // 文件存在，优先读缓存
        // if (fs.existsSync(filePath)) {
        //     return new Promise((resolve, reject) => {
        //         fs.readFile(filePath, (err, data) => (err ? reject(err) : resolve(data)));
        //     });
        // }

        // 文件不存在则缓存
        return this.getObject(bucket, object).then(res => {
            // // 目录不存在，新建目录
            // if (!fs.existsSync(clientTmpDir)) {
            //     fs.mkdirSync(clientTmpDir);
            // }

            // const _filePath = path.join(clientTmpDir, eTag);
            const _buffer = `data:image/png;base64,${res.body.toString('base64')}`;

            sessionStorage.setItem(eTag, _buffer);
            // fs.writeFileSync(_filePath, _buffer);

            return _buffer;
        });
    }
}

export class ClientFactory {
    static fromBucket(bucketName) {
        const credentials = ClientFactory.getCredentials();
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

    static fromRegion(region = REGION_BJ) {
        const credentials = ClientFactory.getCredentials();
        return new Client(region, credentials);
    }

    static getDefault() {
        const credentials = ClientFactory.getCredentials();
        return new Client(REGION_BJ, credentials);
    }

    static getCredentials() {
        return JSON.parse(localStorage.getItem('framework')).auth;
    }

    static produceCredentialsByBucket(bucketName) {
        const credentials = ClientFactory.getCredentials();
        const client = new Client(REGION_BJ, credentials);

        return client.listBuckets().then(res => {
            const {location} = res.buckets.find(item => item.name === bucketName);
            const endpoint = kEndpointMap[location];

            return {endpoint, credentials};
        });
    }

    static produceRegionByBucket(bucketName) {
        const credentials = ClientFactory.getCredentials();
        const client = new Client(REGION_BJ, credentials);

        return client.listBuckets().then(res => {
            const {location} = res.buckets.find(item => item.name === bucketName);
            return location;
        });
    }
}
