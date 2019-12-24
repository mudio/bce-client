import React from 'react';
import {render} from 'react-dom';
import {ipcRenderer} from 'electron';
import {AppContainer} from 'react-hot-loader';

import Root from './containers/Root';
import {configureStore, history} from './store/configureStore';
import {DownloadStatus, UploadStatus} from './utils/TransferStatus';
import {SYNCDISK_CHANGE_SIGNAL} from './actions/syncdisk';
import {startSync, stopSync} from './sync';

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
            const {uploads, downloads, syncdisk, action} = store.getState();
            localStorage.setItem('bos', JSON.stringify({uploads, downloads, syncdisk}));

            //  处理同步事件
            if (action.type === SYNCDISK_CHANGE_SIGNAL) {
                const {status, uuid} = action.mapping;
                status === 'running' ? startSync(uuid) : stopSync(uuid);
            }

            //  告诉主进程当前是否有同步任务
            const paused = syncdisk.mappings.reduce((r, item) => r && item.status === 'paused', true);
            ipcRenderer.send('sync', !paused);
        });

        ipcRenderer.on('notify', (event, type, message) => {
            if (type) {
                store.dispatch({type, message});
            }
        });

        window.globalStore = store;

        //  必须得放在最后才处理
        if (cache.syncdisk && Array.isArray(cache.syncdisk.mappings)) {
            cache.syncdisk.mappings.forEach(item => item.status === 'running' && startSync(item.uuid));
        }

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
