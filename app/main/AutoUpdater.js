/**
 * Main Process - 自动更新
 *
 * @file AutoUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

import http from 'http';
import https from 'https';
import semver from 'semver';
import {app, ipcMain} from 'electron';
import {autoUpdater} from 'electron-updater';

import log from '../utils/logger';
import GlobalConfig from './ConfigManager';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE,
    UPDATE_COMMAND_CHECKING,
    UPDATE_COMMAND_INSTALL
} from '../bos/actions/updater';

const feedURL = GlobalConfig.get('server.feedURL');

export default class AutoUpdater {
    constructor(window) {
        this._window = window;

        this.prepare();

        this._window.webContents.once('did-frame-finish-load', this.checkForUpdates);

        ipcMain.on('notify', (evt, type) => {
            if (type === UPDATE_COMMAND_CHECKING) {
                this.checkForUpdates();
            } else if (type === UPDATE_COMMAND_INSTALL) {
                autoUpdater.quitAndInstall();
            }
        });
    }

    static from(window) {
        return new AutoUpdater(window);
    }

    checkForUpdates() {
        const api = feedURL.startsWith('https') ? https : http;

        api.get(`${feedURL}/latest.json`, res => {
            const {statusCode} = res;
            let rawData = '';

            if (statusCode === 200) {
                res.on('data', chunk => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const {strategies} = JSON.parse(rawData);
                        const strategy = strategies.find(item => semver.satisfies(app.getVersion(), item.semver));

                        autoUpdater.setFeedURL(`${feedURL}/v${strategy.latest}`);
                        autoUpdater.checkForUpdates();
                    } catch (err) {
                        log.error(err.message);
                    }
                });
                return;
            }

            res.resume();
        }).on('error', err => log.error(err.message));
    }

    notify(title, message = '') {
        log.info(title, message);
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
        autoUpdater.on('update-downloaded', info => this.notify(UPDATE_DOWNLOADED, info.version));
    }
}
