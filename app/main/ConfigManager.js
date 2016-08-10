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

export default class ConfigManager {
    constructor() {
        this._store = new ConfigStore('bce', {name: 'bos'});
        if (os.platform() === 'darwin') {
            this._store.path = path.join(os.homedir(), 'Library', 'Preferences', 'bce-config.json');
        }
    }
}
