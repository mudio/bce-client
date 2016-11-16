/**
 * Main Process - 开发者工具注入
 *
 * @file main.js
 * @author mudio(job.mudio@gmail.com)
 */

export default class Development {
    get installExtensions() {
        return async () => {
            if (process.env.NODE_ENV === 'development') {
                const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

                const extensions = [
                    'REACT_DEVELOPER_TOOLS',
                    'REDUX_DEVTOOLS'
                ];
                const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
                for (const name of extensions) { // eslint-disable-line no-restricted-syntax
                    try {
                        await installer.default(installer[name], forceDownload);
                    } catch (e) { } // eslint-disable-line
                }
            }
        };
    }

    showDevTools() {
        if (process.env.NODE_ENV === 'development') {
            require('electron-debug')({showDevTools: true}); // eslint-disable-line global-require
        }
    }
}
