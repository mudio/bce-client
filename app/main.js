/**
 * Main Process - bos client entry
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app} from 'electron';

import {mainLogger} from './bce/utils/Logger';
import MenuManager from './main/MenuManager';
import Development from './main/Development';
import WindowManager from './main/WindowManager';

let windowManager = null;

const shouldQuit = app.makeSingleInstance(() => {
    if (windowManager) {
        windowManager.focusWindow();
    }
});

if (shouldQuit) {
    app.quit();
}

app.on('ready', () => {
    mainLogger('main ready');

    if (process.env.NODE_ENV === 'development') {
        const developer = new Development();
        developer.installExtensions();
    }

    windowManager = new WindowManager();
    windowManager.registerWebContentEvent();
    windowManager.loadURL(`file://${__dirname}/app.html`);

    const currentWindow = windowManager.getWindow();
    const menuManager = new MenuManager(currentWindow);
    menuManager.initMenu();
});

app.on('window-all-closed', () => app.quit());
