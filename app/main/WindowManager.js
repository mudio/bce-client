/**
 * Main Process - 窗口管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

import {BrowserWindow} from 'electron';

import AutoUpdater from './AutoUpdater';

export default class WindowManager {
    constructor(show = false, width = 960, height = 680) {
        this._window = new BrowserWindow({
            show,
            width,
            height,
            frame: false,
            titleBarStyle: 'hidden'
        });
        this._updater = new AutoUpdater(this._window);
    }

    loadURL(url = '') {
        this._window.loadURL(url);
    }

    registerWebContentEvent() {
        this._window.once('ready-to-show', () => {
            this._window.show();
        });

        this._window.on('closed', () => {
            this._window = null;
        });
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
