import React from 'react';
import {render} from 'react-dom';
import {ipcRenderer} from 'electron';
import {AppContainer} from 'react-hot-loader';

import Root from './containers/Root';
import {configureStore, history} from './store/configureStore';
import {DownloadStatus, UploadStatus} from './utils/TransferStatus';

import './style/mixin.global.css';

export default class BceModule {
    static startup(containerNode) {
        const cache = JSON.parse(localStorage.getItem('bos')) || {};

        /**
         * 强退、崩溃可能导致数据有问题，修复下
         */
        if (Array.isArray(cache.downloads)) {
            cache.downloads = cache.downloads.map(item => {
                if (item.status === DownloadStatus.Running) {
                    item.status = DownloadStatus.Paused;
                }

                return item;
            });

            cache.uploads = cache.uploads.map(item => {
                if (item.status === UploadStatus.Running
                    || item.status === UploadStatus.Waiting) {
                    item.status = UploadStatus.Paused;
                }

                return item;
            });
        }

        const store = configureStore(cache);

        store.subscribe(() => {
            const {uploads, downloads} = store.getState();
            localStorage.setItem('bos', JSON.stringify({uploads, downloads}));
        });

        ipcRenderer.on('notify', (event, type, message) => {
            if (type) {
                store.dispatch({type, message});
            }
        });

        window.globalStore = store;

        render(
            <AppContainer>
                <Root store={store} history={history} />
            </AppContainer>,
            containerNode
        );

        if (module.hot) {
            module.hot.accept('./containers/Root', () => {
                const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
                render(
                    <AppContainer>
                        <NextRoot store={store} history={history} />
                    </AppContainer>,
                    containerNode
                );
            });
        }
    }
}
