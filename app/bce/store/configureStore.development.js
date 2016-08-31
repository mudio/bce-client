/**
 * Store - dev Store
 *
 * @file configureStore.development.js
 * @author mudio(job.mudio@gmail.com)
 */

import thunk from 'redux-thunk';
import createLogger from 'redux-logger'; // eslint-disable-line import/no-extraneous-dependencies
import {hashHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';
import {createStore, applyMiddleware, compose} from 'redux';

import api from '../middleware/api';
import rootReducer from '../reducers';
import {upload} from '../middleware/uploader';
import {download} from '../middleware/downloader';

const logger = createLogger({
    level: 'info',
    collapsed: true,
});

const router = routerMiddleware(hashHistory);

const enhancer = compose(
    applyMiddleware(thunk, router, api, upload, download, logger),
    window.devToolsExtension ? window.devToolsExtension() : noop => noop
);

export default function configureStore(initialState) {
    const store = createStore(rootReducer, initialState, enhancer);

    if (module.hot) {
        module.hot.accept('../reducers', () =>
            store.replaceReducer(require('../reducers').default) // eslint-disable-line global-require
        );
    }

    return store;
}
