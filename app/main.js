/**
 * Main Process - bos client entry
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app, ipcMain, dialog} from 'electron';
import log from 'electron-log';

import {isDev} from './utils/helper';
import AutoUpdater from './main/AutoUpdater';
import MenuManager from './main/MenuManager';
import Development from './main/Development';
import WindowManager from './main/WindowManager';

global.log = log;

let _window = null;
let sync = false;

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
    _window = WindowManager.fromLogin(`file://${__dirname}/app.html?login`);
    // 监听通知
    ipcMain.on('notify', (evt, type) => {
        if (type === 'login_success') {
            const win = WindowManager.fromApp(`file://${__dirname}/app.html#/region`);
            _window.close();
            _window = win;

            //  关闭确认
            _window.on('close', e => {
                if (sync) {
                    const index = dialog.showMessageBox({
                        type: 'warning',
                        title: '确认退出',
                        defaultId: 0,
                        message: '检测到您正在进行数据同步任务，关闭后任务将自动结束，是否继续退出？',
                        buttons: ['确认', '取消']
                    });
                    if (index === 1) {
                        return e.preventDefault();
                    }
                    _window = null;
                    app.exit();
                }
            });

            // 初始化自动更新
            AutoUpdater.from(win);
        } else if (type === 'logout') {
            const win = WindowManager.fromLogin(`file://${__dirname}/app.html?login`);
            _window.close();
            _window = win;
        }
    });
    ipcMain.on('sync', (evt, type) => (sync = type));

    // 启动开发者模式
    if (isDev) {
        const developer = new Development();
        developer.supportInspect();
        developer.installExtensions();

        _window.openDevTools();
    }

    // 初始化菜单
    MenuManager.initMenu();
});

app.on('window-all-closed', () => app.quit());
