/**
 * Main Process - bos client entry
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app} from 'electron';

import MenuManager from './main/MenuManager';
import Development from './main/Development';
import WindowManager from './main/WindowManager';
import Win32Installer from './main/Win32SquirrelEventsHandle';

const developer = new Development();
const win32Installer = new Win32Installer();
let windowManager = null;

if (!win32Installer.handleStartupEvent()) {
    const shouldQuit = app.makeSingleInstance(() => {
        if (windowManager) {
            windowManager.focusWindow();
        }
    });

    if (shouldQuit) {
        app.quit();
    }

    if (process.env.NODE_ENV === 'development') {
        developer.enableDebug();
    }

    app.on('ready', async () => {
        await developer.installExtensions();

        windowManager = new WindowManager();
        const currentWindow = windowManager.getWindow();
        windowManager.registerAppEvent();
        windowManager.registerWebContentEvent();
        windowManager.loadURL(`file://${__dirname}/app.html`);

        const menuManager = new MenuManager(currentWindow);
        menuManager.initMenu();
    });
}
