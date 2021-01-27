/**
 * Api - BCE-JDK-BOS Region Client
 *
 * @file client.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import url from 'url';
import {isString} from 'util';
import {BosClient} from '@baiducloud/sdk';

import {REGION_BJ, kRegions} from '../../utils/region';
import GlobalConfig from '../../main/ConfigManager';

export class Client extends BosClient {
    constructor(region, credentials) {
        super({
            credentials,
            endpoint: GlobalConfig.resolveEndpoint(region)
        });
        this.region = region;
        this.credentials = credentials;
    }

    createBucket(bucketName, options) {
        return super.createBucket(bucketName, options);
    }

    putBucketStorageclass(bucketName, storageClass, options) {
        return super.putBucketStorageclass(bucketName, storageClass, options);
    }

    putBucketAcl(bucketName, acl, options) {
        return super.putBucketAcl(bucketName, acl, options);
    }

    listBuckets(config = {}) {
        const {forceUpdate, search} = config;

        if (!forceUpdate) {
            try {
                const {buckets, owner} = JSON.parse(sessionStorage.getItem('buckets'));

                if (search) {
                    return Promise.resolve({
                        owner,
                        buckets: buckets.filter(item => item.name.indexOf(search) > -1)
                    });
                }

                return Promise.resolve({owner, buckets});
            } catch (ex) {} // eslint-disable-line
        }

        return super.listBuckets().then(res => {
            const {buckets, owner} = res.body;
            const response = _.cloneDeep(res.body);
            // hanle multi-az property
            response.buckets = response.buckets.map(bucket => ({
                ...bucket,
                enableMultiAz: !!bucket.enableMultiAz
            }));

            try {
                sessionStorage.setItem('buckets', JSON.stringify(response));
            } catch (ex) {} // eslint-disable-line

            if (search) {
                return {
                    owner,
                    buckets: buckets.filter(item => item.name.indexOf(search) > -1)
                };
            }

            return {
                owner,
                buckets
            };
        });
    }

    getBucketLocation(bucketName) {
        const {buckets = [], owner} = JSON.parse(sessionStorage.getItem('buckets') || '{}');
        const bucket = buckets.find(item => item.name === bucketName);

        if (bucket) {
            return Promise.resolve(bucket.location);
        }


        // 从每个区域中都查一遍,如果查到了说明这个bucket授权给用户了
        return new Promise((resolve, reject) => {
            let completedCount = 0;
            let hasFound = false;

            kRegions.forEach(region => {
                const _client = new Client(region, this.credentials);

                _client.sendRequest('GET', {bucketName, params: {location: ''}}).then(
                    ({body}) => {
                        try {
                            buckets.push({
                                name: bucketName,
                                location: body.locationConstraint,
                                creationDate: new Date()
                            });

                            if (!hasFound) {
                                hasFound = true;
                                sessionStorage.setItem('buckets', JSON.stringify({buckets, owner}));
                            }
                        } catch (ex) {} // eslint-disable-line

                        resolve(body.location);
                    },
                    err => {
                        completedCount += 1;

                        if (completedCount >= kRegions.length) {
                            reject(err);
                        }
                    }
                );
            });
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

    copyObject(sourceBucket, sourceKey, targetBucket, targetKey, options) {
        if (isString(sourceKey)) {
            return super.copyObject(sourceBucket, sourceKey, targetBucket, targetKey, options);
        }

        // 文件大于5g要三步复制，这里超过1g就三步复制
        const MAX_COPY_PART_SIZE = 1073741824; // 1G

        if (sourceKey.size > MAX_COPY_PART_SIZE) {
            return this.initiateMultipartUpload(targetBucket, targetKey).then(res => {
                const ranges = [];
                let length = sourceKey.size;
                const {uploadId} = res.body;

                while (length > 0) {
                    const begin = ranges.length * MAX_COPY_PART_SIZE;
                    const end = length > MAX_COPY_PART_SIZE
                        ? ranges.length * MAX_COPY_PART_SIZE + MAX_COPY_PART_SIZE - 1
                        : ranges.length * MAX_COPY_PART_SIZE + length - 1;

                    ranges.push(`${begin}-${end}`);
                    length -= MAX_COPY_PART_SIZE;
                }

                return Promise.all(ranges.map((range, index) => this.uploadPartCopy(
                    sourceBucket, sourceKey.key, targetBucket, targetKey, uploadId, index + 1, range
                ))).then(parts => this.completeMultipartUpload(
                    targetBucket, targetKey, uploadId,
                    parts.map((item, index) => Object({
                        partNumber: index + 1,
                        eTag: item.body.eTag
                    }))
                ));
            });
        }

        if (isString(sourceKey.key)) {
            return super.copyObject(sourceBucket, sourceKey.key, targetBucket, targetKey, options);
        }

        return Promise.reject(new Error('Invalid Argument'));
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

    generatePresignedUrl(bucketName, objectKey, ...args) {
        const authorizationUrl = super.generatePresignedUrl(bucketName, objectKey, ...args);

        const {endpoint} = this.config;
        const urlOpt = url.parse(endpoint);
        urlOpt.protocol = 'https';
        urlOpt.pathname = `/v1/${bucketName}/${objectKey}`;

        // 如果是公共读的，则不算签名了
        const objectUrl = url.format(urlOpt);
        return fetch(objectUrl, {method: 'HEAD'}).then(
            ({ok}) => (ok ? objectUrl : authorizationUrl)
        );
    }
}

export class ClientFactory {
    static fromBucket(bucketName) {
        const credentials = ClientFactory.getCredentials();
        const client = new Client(REGION_BJ, credentials);

        return client.getBucketLocation(bucketName).then(location => {
            if (location) {
                return new Client(location, credentials);
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

        return ClientFactory.produceRegionByBucket(bucketName).then(
            location => Object({endpoint: GlobalConfig.resolveEndpoint(location), credentials})
        );
    }

    static produceRegionByBucket(bucketName) {
        const credentials = ClientFactory.getCredentials();
        const client = new Client(REGION_BJ, credentials);

        return client.getBucketLocation(bucketName);
    }
}
