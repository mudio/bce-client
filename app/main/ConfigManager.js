/**
 * Main Process - 程序配置管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import ConfigStore from 'configstore';
import {REGION_BJ, REGION_GZ} from '../bce/utils/Region';

const config = new ConfigStore(
    'bce',
    {
        endpoint: {
            [REGION_BJ]: 'http://bj.bcebos.com',
            [REGION_GZ]: 'http://gz.bcebos.com'
        }
    },
    {globalConfigPath: true}
);

export default config;
