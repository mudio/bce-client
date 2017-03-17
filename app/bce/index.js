/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import './style/mixin.global.css';
import Extensions from './components/Extensions';
import LoginPage from './containers/LoginPage';
import configureStore from './store/configureStore';

const extensions = document.getElementById('extensions');
const cache = JSON.parse(localStorage.getItem('cache')) || {};

window.globalStore = configureStore(cache);
window.globalStore.subscribe(() => {
    const {auth} = window.globalStore.getState();
    const config = JSON.stringify({auth});
    localStorage.setItem('cache', config);
});

electron.ipcRenderer.on('notify', (event, type, message) => {
    if (type) {
        window.globalStore.dispatch({type, message});
    }
});

function renderLoginPage() {
    render(
        <Provider store={window.globalStore}>
            <LoginPage />
        </Provider>
        , document.getElementById('main')
    );
}

function renderHomePage() {
    render(<Extensions />, extensions);

    document.body.onkeypress = ({code, target}) => {
        if (target.tagName === 'INPUT') {
            return;
        }

        if (code === 'Backquote' && extensions.className.indexOf('fadeIn') === -1) {
            extensions.className = 'fadeIn';
        } else {
            extensions.className = 'fadeOut';
        }
    };
}

if (/login.html$/.test(location.pathname)) {
    // 登陆
    renderLoginPage();
} else if (/app.html$/.test(location.pathname)) {
    // 首页
    renderHomePage();
}

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();
