/**
 * Main Process - 程序配置管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import os from 'os';
import path from 'path';
import ConfigStore from 'configstore';
import {REGION_BJ, REGION_GZ} from '../bce/utils/Region';

// TODO: 这里会生成~/.config/undefine.json
const config = new ConfigStore();
config.path = path.join(os.homedir(), '.bce', 'config.json');
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
