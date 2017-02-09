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
                // TODO: Use async interation statement.
                //       Waiting on https://github.com/tc39/proposal-async-iteration
                //       Promises will fail silently, which isn't what we want in development
                return Promise
                    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
                    .catch(console.log);    // eslint-disable-line
            }
        };
    }

    showDevTools() {
        if (process.env.NODE_ENV === 'development') {
            require('electron-debug')({showDevTools: true}); // eslint-disable-line global-require
        }
    }
}
