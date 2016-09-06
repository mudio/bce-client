/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import debug from 'debug';
import {render} from 'react-dom';
import {ipcRenderer} from 'electron';
import {Provider} from 'react-redux';
import {Router, hashHistory} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';

import './app.global.css';
import routes from './routes';
import configureStore from './store/configureStore';

const logger = debug('bce-client:renderer');
const cache = JSON.parse(localStorage.getItem('cache')) || {};
const store = configureStore(cache);
const history = syncHistoryWithStore(hashHistory, store);

logger('startup');

store.subscribe(() => {
    const {auth} = store.getState();
    localStorage.setItem('cache', JSON.stringify({auth}));
});

ipcRenderer.on('notify', (event, type, message) => {
    if (type) {
        store.dispatch({type, message});
    }
});

render(
    <Provider store={store}>
        <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('main')
);

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();
