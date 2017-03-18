/**
 * Main Process - bos client entry
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app, ipcMain} from 'electron';

import {isDev} from './utils/helper';
import AutoUpdater from './main/AutoUpdater';
import MenuManager from './main/MenuManager';
import Development from './main/Development';
import WindowManager from './main/WindowManager';

let _window = null;

const shouldQuit = app.makeSingleInstance(() => {
    if (_window) {
        if (_window.isMinimized()) {
            _window.restore();
        }

        _window.focus();
    }
});

if (shouldQuit) {
    app.quit();
}

app.on('ready', () => {
    // 开启登陆
    _window = WindowManager.fromLogin(`file://${__dirname}/login.html`);
    // 监听通知
    ipcMain.on('notify', (evt, msg) => {
        if (msg.type === 'login_success') {
            const win = WindowManager.fromApp(`file://${__dirname}/app.html#/region`);
            _window.close();
            _window = win;
            // 初始化菜单
            MenuManager.initMenu();
            // 初始化自动更新
            AutoUpdater.from(win);
        } else if (msg.type === 'logout') {
            const win = WindowManager.fromLogin(`file://${__dirname}/login.html`);
            _window.close();
            _window = win;
        }
    });

    // 启动开发者模式
    if (isDev) {
        const developer = new Development();
        developer.supportInspect();
        developer.installExtensions();

        _window.openDevTools();
    }
});

app.on('window-all-closed', () => app.quit());
