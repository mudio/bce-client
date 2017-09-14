/**
 * Main Process - 程序配置管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import ConfigStore from 'configstore';
import {REGION_BJ, REGION_GZ, REGION_SU} from '../utils/region';

const bcedir = path.join('..', '.bce');
const config = new ConfigStore(bcedir, {}, {globalConfigPath: true});

config.all = {
    endpoint: Object.assign(
        {
            [REGION_BJ]: 'https://bj.bcebos.com',
            [REGION_GZ]: 'https://gz.bcebos.com',
            [REGION_SU]: 'https://su.bcebos.com'
        },
        config.all.endpoint
    ),
    credentials: config.all.credentials
};

export default config;
