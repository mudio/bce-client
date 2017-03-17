/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import './style/mixin.global.css';
import LoginPage from './containers/LoginPage';
import configureStore from './store/configureStore';
import startup from '../bos/index';


function renderLoginPage() {
    const cache = JSON.parse(localStorage.getItem('framework')) || {};

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

if (/login.html$/.test(location.pathname)) {
    // 登陆
    renderLoginPage();
} else if (/app.html$/.test(location.pathname)) {
    // 首页
    renderHomePage();
}

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();
