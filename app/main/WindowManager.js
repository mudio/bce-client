/**
 * Main Process - 窗口管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {app, BrowserWindow} from 'electron';
import AutoUpdater from './AutoUpdater';

export default class WindowManager {
    constructor(show = false, width = 960, height = 680) {
        this._window = new BrowserWindow({
            show,
            width,
            height,
            frame: false,
            titleBarStyle: 'hidden-inset'
        });
        this._updater = new AutoUpdater(this._window);
    }

    loadURL(url = '') {
        this._window.loadURL(url);
    }

    registerWebContentEvent() {
        this._window.webContents.on('did-finish-load', () => {
            this._window.show();
            this._window.focus();
        });

        this._window.webContents.once('did-frame-finish-load', () => {
            this._updater.checkForUpdates();
        });

        this._window.on('closed', () => {
            this._window = null;
        });
    }

    registerAppEvent() {
        app.on('window-all-closed', () => app.quit());
    }

    getWindow() {
        return this._window;
    }

    focusWindow() {
        if (this._window.isMinimized()) {
            this._window.restore();
        }

        this._window.focus();
    }
}
