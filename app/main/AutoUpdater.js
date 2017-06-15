/**
 * Main Process - 自动更新
 *
 * @file AutoUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

import http from 'http';
import semver from 'semver';
import {app, dialog} from 'electron';
import {autoUpdater} from 'electron-updater';

import log from '../utils/logger';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../bce/actions/updater';

// const feedURL = 'http://bce-bos-client.bos.qasandbox.bcetest.baidu.com/releases';
const feedURL = 'http://bce-bos-client.bj.bcebos.com/releases';

export default class AutoUpdater {
    constructor(window) {
        this._window = window;

        this.prepare();

        this._window.webContents.once('did-frame-finish-load', this.checkForUpdates);
    }

    static from(window) {
        return new AutoUpdater(window);
    }

    checkForUpdates() {
        http.get(`${feedURL}/lastest.json`, res => {
            const statusCode = res.statusCode;
            let rawData = '';

            if (statusCode === 200) {
                res.on('data', chunk => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const {strategies} = JSON.parse(rawData);
                        const strategy = strategies.find(item => semver.satisfies(app.getVersion(), item.semver));

                        autoUpdater.setFeedURL(`${feedURL}/v${strategy.lastest}`);
                        autoUpdater.checkForUpdates();
                    } catch (err) {
                        log.error(err.message);
                    }
                });
                return;
            }

            res.resume();
        })
        .on('error', err => log.error(err.message));
    }

    notify(title, message = '') {
        log.debug(title, message);
        this._window.webContents.send('notify', title, message);
    }

    prepare() {
        autoUpdater.on('error', error => {
            log.error(error.message);
            this.notify(UPDATE_ERROR);
        });

        autoUpdater.on('update-available', () => this.notify(UPDATE_AVAILABLE));
        autoUpdater.on('checking-for-update', () => this.notify(UPDATE_CHECKING));
        autoUpdater.on('update-not-available', () => this.notify(UPDATE_NOT_AVAILABLE));
        autoUpdater.on('update-downloaded', info => {
            this.notify(UPDATE_DOWNLOADED, info.version);

            dialog.showMessageBox({
                type: 'question',
                title: '更新提示',
                message: `客户端已经自动更新至${info.version}，重新启动后生效！`,
                buttons: ['重启', '取消']
            }, (bIndex) => {
                if (bIndex === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }
}
