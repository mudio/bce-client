/**
 * Main Process - bos client entry
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import debug from 'debug';
import {app} from 'electron';

import MenuManager from './main/MenuManager';
import Development from './main/Development';
import WindowManager from './main/WindowManager';
import Win32Installer from './main/Win32SquirrelEventsHandle';

const developer = new Development();
const logger = debug('bce-client:main');
const win32Installer = new Win32Installer();
let windowManager = null;

logger('startup');

if (!win32Installer.handleStartupEvent()) {
    const shouldQuit = app.makeSingleInstance(() => {
        if (windowManager) {
            windowManager.focusWindow();
        }
    });

    if (shouldQuit) {
        app.quit();
    }

    developer.showDevTools();

    app.on('ready', async () => {
        logger('ready');
        await developer.installExtensions();

        windowManager = new WindowManager();
        windowManager.registerAppEvent();
        windowManager.registerWebContentEvent();
        windowManager.loadURL(`file://${__dirname}/app.html`);

        const currentWindow = windowManager.getWindow();
        const menuManager = new MenuManager(currentWindow);
        menuManager.initMenu();
    });
}
