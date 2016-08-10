/**
 * Main Process - 菜单管理
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {app, Menu, shell, getCurrentWindow} from 'electron';

export default class MenuManager {
    constructor(window) {
        this._window = window || getCurrentWindow();
    }

    initMenu() {
        const name = app.getName();

        if (process.env.NODE_ENV === 'development') {
            this._window.webContents.on('context-menu', (e, props) => {
                const {x, y} = props;

                Menu.buildFromTemplate([
                    {
                        label: '查看元素',
                        click() {
                            this._window.inspectElement(x, y);
                        }
                    }
                ]).popup(this._window);
            });
        }

        if (process.platform === 'darwin') {
            const template = [
                {
                    label: name,
                    submenu: [
                        {
                            label: '关于',
                            selector: 'orderFrontStandardAboutPanel:'
                        },
                        {
                            label: '刷新',
                            accelerator: 'CmdOrCtrl+R',
                            click: (item, focusedWindow) => {
                                if (focusedWindow != null) {
                                    focusedWindow.reload();
                                }
                            }
                        },
                        {
                            label: '全屏',
                            accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
                            click: (item, focusedWindow) => {
                                if (focusedWindow) {
                                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                                }
                            }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: '退出',
                            accelerator: 'Command+Q',
                            click() {
                                app.quit();
                            }
                        }
                    ]
                },
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
                            label: '功能建议',
                            click() {
                                shell.openExternal('https://github.com/mudio/bos/issues');
                            }
                        },
                        {
                            label: '开发者文档',
                            click() {
                                shell.openExternal(
                                    'https://cloud.baidu.com/doc/BOS/JavaScript-SDK.html#.E6.A6.82.E8.BF.B0'
                                );
                            }
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: 'JavaScript SDK',
                            click() {
                                shell.openExternal('https://github.com/baidubce/bce-sdk-js');
                            }
                        },
                        {
                            label: 'Web Uploader',
                            click() {
                                shell.openExternal('https://github.com/leeight/bce-bos-uploader/');
                            }
                        }
                    ]
                }
            ];

            const menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    }
}
