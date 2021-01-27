/**
 * client publisher: 发布最新版本文件到BOS上
 *
 * @file versionPubliser.js
 * @author zhaowenli@baidu.com
 */

/* eslint-disable max-len, no-console */

import {BosClient} from '@baiducloud/sdk';

import appPackage from '../static/package.json';

const {version} = appPackage;
const {BOS_AK, BOS_SK, BOS_ENDPOINT} = process.env;
const bucket = 'bce-bos-client';
const latestVersion = 'releases/latest.json';

const client = new BosClient({
    credentials: {
        ak: BOS_AK,
        sk: BOS_SK
    },
    endpoint: BOS_ENDPOINT
});

if (BOS_AK && BOS_SK && BOS_ENDPOINT) {
    // 上传最新版本文件
    const config = {version, strategies: [{semver: '*', latest: version}]};
    client.putObjectFromString(bucket, latestVersion, JSON.stringify(config))
        .then(
            () => console.log(`上传完毕 => ${latestVersion}`),
            ex => console.error(ex)
        );
} else {
    console.log('终止发布操作，请配置环境变量BOS_AK、BOS_SK、BOS_ENDPOINT。');
}
