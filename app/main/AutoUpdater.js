/**
 * Main Process - 自动更新
 *
 * @file OSXUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

import os from 'os';
import request from 'request';
import {app, autoUpdater} from 'electron';
import {mainLogger} from '../bce/utils/Logger';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../bce/actions/updater';

const UPDATE_SERVER_HOST = 'bceclient.duapp.com';

export default class OSXUpdater {
    constructor(window) {
        this._window = window;

        this.prepare();

        this._window.webContents.once('did-frame-finish-load', () => {
            autoUpdater.checkForUpdates();
        });
    }

    notify(title, message) {
        this._window.webContents.send('notify', title, message);
    }

    prepare() {
        const platform = os.platform();
        const feedURL = `http://${UPDATE_SERVER_HOST}/update/${platform}/${app.getVersion()}`;

        autoUpdater.on('update-available', () => this.notify(UPDATE_AVAILABLE));
        autoUpdater.on(
            'update-downloaded',
            (event, releaseNotes, releaseName) => this.notify(UPDATE_DOWNLOADED, {releaseName})
        );
        autoUpdater.on('error', error => {
            mainLogger(error.message);

            request(feedURL, (err, response, body) => {
                if (err) {
                    mainLogger(err.message);
                    return this.notify(UPDATE_ERROR, {error: err.message});
                }

                if (response.statusCode === 200) {
                    const {name} = JSON.parse(body);
                    return this.notify(UPDATE_ERROR, {
                        releaseName: name,
                        url: 'https://cloud.baidu.com/doc/BOS/BOSCLI.html#BOS.E6.A1.8C.E9.9D.A2'
                    });
                }
            });
        });
        autoUpdater.on('checking-for-update', () => this.notify(UPDATE_CHECKING));
        autoUpdater.on('update-not-available', () => this.notify(UPDATE_NOT_AVAILABLE));

        autoUpdater.setFeedURL(feedURL);
    }
}

