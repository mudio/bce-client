/**
 * Main Process - 程序配置管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import ConfigStore from 'configstore';
import {REGION_BJ, REGION_GZ} from '../bce/utils/Region';

const bcedir = path.join('..', '.bce');
const config = new ConfigStore(bcedir, {}, {globalConfigPath: true});

config.all = Object.assign(
    {
        endpoint: {
            [REGION_BJ]: 'http://bj.bcebos.com',
            [REGION_GZ]: 'http://gz.bcebos.com'
        }
    },
    config.all
);

export default config;
