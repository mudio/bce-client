/**
 * Main Process - 开发者工具注入
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable global-require */

import {BrowserWindow, Menu} from 'electron';

import {error} from '../utils/logger';

export default class Development {
    constructor() {
        require('electron-debug')({showDevTools: true});
    }

    supportInspect() {
        BrowserWindow.getAllWindows().forEach(_window => {
            _window.webContents.on('context-menu', (e, props) => {
                const {x, y} = props;

                Menu.buildFromTemplate([
                    {
                        label: '查看元素',
                        click: () => {
                            _window.inspectElement(x, y);
                        }
                    }
                ]).popup(_window);
            });
        });
    }

    installExtensions() {
        const installer = require('electron-devtools-installer');

        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        // TODO: Use async interation statement.
        //       Waiting on https://github.com/tc39/proposal-async-iteration
        //       Promises will fail silently, which isn't what we want in development
        return Promise
            .all(extensions.map(name => installer.default(installer[name], forceDownload)))
            .catch(error);
    }
}
