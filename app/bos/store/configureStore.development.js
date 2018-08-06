/**
 * Store - dev Store
 *
 * @file configureStore.development.js
 * @author mudio(job.mudio@gmail.com)
 */

import thunk from 'redux-thunk';
import {createHashHistory} from 'history';
import {createLogger} from 'redux-logger';
import {createStore, applyMiddleware, compose} from 'redux';
import {routerMiddleware, routerActions} from 'react-router-redux';

import api from '../middleware/api';
import upload from '../middleware/uploader';
import download from '../middleware/downloader';

import rootReducer from '../reducers';

import * as contextActions from '../actions/context';
import * as downloaderActions from '../actions/downloader';
import * as explorerActions from '../actions/explorer';
import * as navigatorActions from '../actions/navigator';
import * as transferActions from '../actions/transfer';
import * as uploaderActions from '../actions/uploader';
import * as windowActions from '../actions/window';

const history = createHashHistory();

const configureStore = (initialState) => {
    // Redux Configuration
    const middleware = [api, upload, download];
    const enhancers = [];

    // Thunk Middleware
    middleware.push(thunk);

    // Logging Middleware
    const logger = createLogger({
        level: 'info',
        collapsed: true
    });

    // Skip redux logs in console during the tests
    if (process.env.NODE_ENV !== 'test') {
        middleware.push(logger);
    }

    // Router Middleware
    const router = routerMiddleware(history);
    middleware.push(router);

    // Redux DevTools Configuration
    const actionCreators = {
        ...contextActions,
        ...downloaderActions,
        ...explorerActions,
        ...navigatorActions,
        ...transferActions,
        ...uploaderActions,
        ...windowActions,
        ...routerActions,
    };
    // If Redux DevTools Extension is installed use it, otherwise use Redux compose
    /* eslint-disable no-underscore-dangle */
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
            actionCreators,
        })
        : compose;
    /* eslint-enable no-underscore-dangle */

    // Apply Middleware & Compose Enhancers
    enhancers.push(applyMiddleware(...middleware));
    const enhancer = composeEnhancers(...enhancers);

    // Create Store
    const store = createStore(rootReducer, initialState, enhancer);

    if (module.hot) {
        module.hot.accept(
            '../reducers',
            () => store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
        );
    }

    return store;
};

export default {
    configureStore,
    history
};
