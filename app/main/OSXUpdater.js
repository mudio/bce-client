/**
 * Main Process - 自动更新
 *
 * @file OSXUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }], no-unused-vars: 0 */

import * as os from 'os';
import {app, autoUpdater} from 'electron';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../bce/actions/updater';

const UPDATE_SERVER_HOST = '182.61.16.60';

export default class OSXUpdater {
    constructor(window) {
        this._window = window;
    }

    notify(title, message) {
        this._window.webContents.send('notify', title, message);
    }

    checkForUpdates() {
        if (os.platform() !== 'darwin') {
            return;
        }

        autoUpdater.on('update-available', () => this.notify('发现新版本'));
        autoUpdater.on(
            'update-downloaded',
            (event, releaseNotes, releaseName, releaseDate, updateURL) => this.notify(
                UPDATE_DOWNLOADED,
                `新版本 ${releaseName} 已经下载，重启客户端将自动安装更新`
            )
        );
        autoUpdater.on('error', error => this.notify(UPDATE_ERROR, error.message));
        autoUpdater.on('checking-for-update', () => this.notify(UPDATE_CHECKING, '正在检查更新'));
        autoUpdater.on('update-not-available', () => this.notify(UPDATE_NOT_AVAILABLE, '没有可用的更新'));
        autoUpdater.setFeedURL(
            `http://${UPDATE_SERVER_HOST}/update/${os.platform()}_${os.arch()}/${app.getVersion()}`
        );

        autoUpdater.checkForUpdates();
    }
}

