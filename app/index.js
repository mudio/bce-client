/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import './app.global.css';
import routes from './routes';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router, hashHistory} from 'react-router';
import configureStore from './store/configureStore';
import {syncHistoryWithStore} from 'react-router-redux';

const auth = JSON.parse(localStorage.getItem('auth')) || {isAuth: false, isLoading: false};
const store = configureStore({auth});
const history = syncHistoryWithStore(hashHistory, store);

store.subscribe(() => localStorage.setItem('auth', JSON.stringify(store.getState().auth)));

render(
    <Provider store={store}>
        <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('main')
);
