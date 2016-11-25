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

import './app.global.css';
import './mime.global.css';
import routes from './routes';
import {renderLogger} from './utils/Logger';
import configureStore from './store/configureStore';

const cache = JSON.parse(localStorage.getItem('cache')) || {};
window.globalStore = configureStore(cache);
const history = syncHistoryWithStore(hashHistory, window.globalStore);

renderLogger('startup');

window.globalStore.subscribe(() => {
    const {auth, uploads} = window.globalStore.getState();
    localStorage.setItem('cache', JSON.stringify({auth, uploads}));
});

ipcRenderer.on('notify', (event, type, message) => {
    if (type) {
        window.globalStore.dispatch({type, message});
    }
});

render(
    <Provider store={window.globalStore}>
        <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('main')
);

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();
