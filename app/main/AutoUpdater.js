/**
 * Main Process - 自动更新
 *
 * @file OSXUpdater.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }], no-unused-vars: 0 */

import debug from 'debug';
import * as os from 'os';
import request from 'request';
import {app, autoUpdater} from 'electron';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../bce/actions/updater';

const logger = debug('bce-client:updater');
const UPDATE_SERVER_HOST = 'bceclient.duapp.com';

export default class OSXUpdater {
    constructor(window) {
        this._window = window;
    }

    notify(title, message) {
        this._window.webContents.send('notify', title, message);
    }

    checkForUpdates() {
        const platform = os.platform();
        const feedURL = `http://${UPDATE_SERVER_HOST}/update/${platform}/${app.getVersion()}`;

        autoUpdater.on('update-available', () => this.notify(UPDATE_AVAILABLE));
        autoUpdater.on(
            'update-downloaded',
            (event, releaseNotes, releaseName) => this.notify(UPDATE_DOWNLOADED, {releaseName})
        );
        autoUpdater.on('error', error => {
            logger(error.message);

            request(feedURL, (err, response, body) => {
                if (err) {
                    logger(err.message);
                    return this.notify(UPDATE_ERROR, {error: err.message});
                }

                if (response.statusCode === 200) {
                    const {name, url} = JSON.parse(body);
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
        autoUpdater.checkForUpdates();
    }
}

