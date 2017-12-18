/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {remote} from 'electron';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import 'antd/lib/style/css';

import './style/mixin.global.css';
import startup from '../bos/index';
import LoginPage from './containers/LoginPage';
import configureStore from './store/configureStore';

function renderLoginPage() {
    const cache = JSON.parse(localStorage.getItem('framework')) || {};

    if (localStorage.getItem('version') !== remote.app.getVersion()) {
        localStorage.clear();
        localStorage.setItem('version', remote.app.getVersion());
    }

    window.globalStore = configureStore(cache);
    window.globalStore.subscribe(() => {
        const {auth} = window.globalStore.getState();
        const config = JSON.stringify({auth});
        localStorage.setItem('framework', config);
    });

    render(
        <Provider store={window.globalStore}>
            <LoginPage />
        </Provider>
        , document.getElementById('main')
    );
}

function renderHomePage() {
    startup(document.getElementById('main'));
}

if (/login.html$/.test(window.location.pathname)) {
    // 登陆
    renderLoginPage();
} else if (/app.html$/.test(window.location.pathname)) {
    // 首页
    renderHomePage();
}

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();
