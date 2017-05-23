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

const cache = JSON.parse(localStorage.getItem('bos')) || {};
window.globalStore = configureStore(cache);

window.globalStore.subscribe(() => {
    const {navigator, uploads, downloads} = window.globalStore.getState();
    localStorage.setItem('bos', JSON.stringify({uploads, downloads, navigator}));
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
