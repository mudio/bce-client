/**
 * Main Process - bos client entry
 *
 * @file main.development.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app, BrowserWindow, Menu, shell} from 'electron';

let menu;
let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
    require('electron-debug')(); // eslint-disable-line global-require
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async () => {
    if (process.env.NODE_ENV === 'development') {
        const installer = require('electron-devtools-installer'); // eslint-disable-line global-require
        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        for (const name of extensions) {
            try {
                await installer.default(installer[name], forceDownload);
            } catch (e) { } // eslint-disable-line
        }
    }
};

app.on('ready', async () => {
    await installExtensions();

    mainWindow = new BrowserWindow({
        show: false,
        width: 980,
        height: 720
    });

    mainWindow.loadURL(`file://${__dirname}/app/app.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();

        // auto update
        // const updateUrl = `http://127.0.0.1:5000/update/osx_${os.arch()}/0.0.1-alpha.1`;
        // autoUpdater.setFeedURL(updateUrl);
        // autoUpdater.on('checking-for-update', evt => console.log("===================", evt));
        // autoUpdater.on('update-available', evt => console.log("===================", evt));
        // autoUpdater.on('update-downloaded', evt => console.log("===================", evt));
        // autoUpdater.on('error', evt => console.log("===================", evt));
        // autoUpdater.checkForUpdates();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.openDevTools();
        mainWindow.webContents.on('context-menu', (e, props) => {
            const {x, y} = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click() {
                        mainWindow.inspectElement(x, y);
                    }
                }]).popup(mainWindow);
        });
    }

    const template = [
        {
            label: '帮助',
            submenu: [
                {
                    label: '学习更多',
                    click() {
                        shell.openExternal('https://mudio.github.com/bos');
                    }
                },
                {
                    label: '开发者文档',
                    click() {
                        shell.openExternal('https://cloud.baidu.com/doc/BOS/JavaScript-SDK.html#.E6.A6.82.E8.BF.B0');
                    }
                },
                {
                    label: 'BCE-SDK-JS',
                    click() {
                        shell.openExternal('https://baidubce.github.io/bce-sdk-js/');
                    }
                },
                {
                    label: '浏览器上传',
                    click() {
                        shell.openExternal('http://leeight.github.io/bce-bos-uploader/');
                    }
                },
                {
                    label: '功能建议',
                    click() {
                        shell.openExternal('https://github.com/mudio/bos/issues');
                    }
                }
            ]
        }
    ];

    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
});
