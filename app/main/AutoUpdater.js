/**
 * Main Process - 自动更新
 *
 * @file AutoUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

import {autoUpdater} from 'electron-updater';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../bce/actions/updater';

const feedURL = 'http://bce-bos-client.bj.bcebos.com/releases/';

export default class AutoUpdater {
    constructor(window) {
        this._window = window;

        this.prepare();

        this._window.webContents.once('did-frame-finish-load', () => {
            autoUpdater.checkForUpdates();
        });
    }

    static from(window) {
        return new AutoUpdater(window);
    }

    notify(title, message) {
        this._window.webContents.send('notify', title, message);
    }

    prepare() {
        autoUpdater.on('update-available', () => this.notify(UPDATE_AVAILABLE));
        autoUpdater.on('error', error => this.notify(UPDATE_ERROR, error.message));
        autoUpdater.on('checking-for-update', () => this.notify(UPDATE_CHECKING));
        autoUpdater.on('update-not-available', () => this.notify(UPDATE_NOT_AVAILABLE));
        autoUpdater.on(
            'update-downloaded',
            info => this.notify(UPDATE_DOWNLOADED, info)
        );

        autoUpdater.setFeedURL(feedURL);
    }
}
