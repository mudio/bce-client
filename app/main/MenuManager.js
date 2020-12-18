/**
 * Main Process - 菜单管理
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app, Menu, shell} from 'electron';

import {isOSX} from '../utils';

export default class MenuManager {
    static initMenu() {
        const name = app.getName();

        if (isOSX) {
            const template = [
                {
                    label: name,
                    submenu: [
                        {
                            label: '关于',
                            selector: 'orderFrontStandardAboutPanel:'
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
                    label: '操作',
                    submenu: [
                        {label: '全选', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'},
                        {label: '剪切', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
                        {label: '复制', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
                        {label: '粘贴', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
                        {
                            type: 'separator'
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
                            accelerator: isOSX ? 'Ctrl+Command+F' : 'F11',
                            click: (item, focusedWindow) => {
                                if (focusedWindow) {
                                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                                }
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
                                    'https://cloud.baidu.com/doc/BOS/s/Ok1rk605h'
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
                        }
                    ]
                }
            ];

            const menu = Menu.buildFromTemplate(template);
            Menu.setApplicationMenu(menu);
        }
    }
}
