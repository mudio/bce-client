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

import LoginPage from './containers/LoginPage';
import configureStore from './store/configureStore';

export default function bootstrap(containers) {
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
        ,
        containers
    );
}
