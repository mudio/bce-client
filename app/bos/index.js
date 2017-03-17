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
import {Router, hashHistory} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';

import './style/mixin.global.css';
import routes from './routes';
import configureStore from './store/configureStore';

const cache = JSON.parse(localStorage.getItem('cache')) || {};
window.globalStore = configureStore(cache);
const history = syncHistoryWithStore(hashHistory, window.globalStore);

window.globalStore.subscribe(() => {
    const {navigator, auth, uploads, downloads} = window.globalStore.getState();
    localStorage.setItem('cache', JSON.stringify({auth, uploads, downloads, navigator}));
});

ipcRenderer.on('notify', (event, type, message) => {
    if (type) {
        window.globalStore.dispatch({type, message});
    }
});

export default function startup(container) {
    render(
        <Provider store={window.globalStore}>
            <Router history={history} routes={routes} />
        </Provider>,
        container
    );
}
