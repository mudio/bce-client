/**
 * Main Process - 窗口管理
 *
 * @file WindowManager.js
 * @author mudio(job.mudio@gmail.com)
 */

import {BrowserWindow} from 'electron';

import {name, version} from '../../package.json';

export default class WindowManager {
    constructor(width = 960, height = 680, option = {}) {
        this._window = new BrowserWindow(
            Object.assign(
                {show: false, frame: false, titleBarStyle: 'hidden', backgroundColor: '#444c63'},
                option,
                {width, height}
            )
        );

        this.overrideUserAgent();
    }

    static fromLogin(url) {
        const currentWindow = new WindowManager(280, 340, {
            resizable: false, maximizable: false, minimizable: false
        });
        currentWindow.registerWebContentEvent();
        currentWindow.loadURL(url);

        return currentWindow.getWindow();
    }

    static fromApp(url) {
        const currentWindow = new WindowManager();
        currentWindow.registerWebContentEvent();
        currentWindow.loadURL(url);

        return currentWindow.getWindow();
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

    overrideUserAgent() {
        this._window.webContents.setUserAgent(`${name}/${version}`);
    }

    getWindow() {
        return this._window;
    }

    close() {
        this._window.close();
    }
}
