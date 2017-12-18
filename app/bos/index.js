/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {render} from 'react-dom';
import {ipcRenderer} from 'electron';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';

import './style/mixin.global.css';

import Routes from './routes';
import {configureStore, history} from './store/configureStore';
import {DownloadStatus, UploadStatus} from './utils/TransferStatus';

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

window.globalStore = configureStore(cache);

window.globalStore.subscribe(() => {
    const {uploads, downloads} = window.globalStore.getState();
    localStorage.setItem('bos', JSON.stringify({uploads, downloads}));
});

ipcRenderer.on('notify', (event, type, message) => {
    if (type) {
        window.globalStore.dispatch({type, message});
    }
});

export default function startup(container) {
    render(
        <Provider store={window.globalStore}>
            <ConnectedRouter history={history}>
                <Routes />
            </ConnectedRouter>
        </Provider>,
        container
    );
}
