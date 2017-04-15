/**
 * Store - dev Store
 *
 * @file configureStore.development.js
 * @author mudio(job.mudio@gmail.com)
 */

import thunk from 'redux-thunk';
import logger from 'redux-logger';
import {hashHistory} from 'react-router';
import {routerMiddleware, push} from 'react-router-redux';
import {createStore, applyMiddleware, compose} from 'redux';

import api from '../middleware/api';
import rootReducer from '../reducers';
import * as counterActions from '../actions/updater';

const actionCreators = {
    ...counterActions,
    push,
};

const router = routerMiddleware(hashHistory);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators,
    }) :
    compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
    applyMiddleware(thunk, router, api, logger)
);

export default function configureStore(initialState) {
    const store = createStore(rootReducer, initialState, enhancer);

    if (module.hot) {
        module.hot.accept('../reducers', () =>
            store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
        );
    }

    return store;
}
