/**
 * Main Process - 程序配置管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import ConfigStore from 'configstore';
import {REGION_BJ, REGION_HK02} from '../utils/region';

const bcedir = path.join('..', '.bce');
const config = new ConfigStore(bcedir, {}, {globalConfigPath: true});

const {server, credentials, endpoint = {}} = config.all;

config.all = {
    credentials,
    endpoint: Object.assign(
        {
            [REGION_HK02]: 'https://hk-2.bcebos.com'
        },
        endpoint
    ),
    server: Object.assign(
        {feedURL: 'https://bce-bos-client.bj.bcebos.com/releases'},
        server
    )
};

config.resolveEndpoint = (region = REGION_BJ) => (config.get('endpoint')[region] || `https://${region}.bcebos.com`);

export default config;
