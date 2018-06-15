/**
 * Store - Product Store
 *
 * @file configureStore.production.js
 * @author mudio(job.mudio@gmail.com)
 */

import thunk from 'redux-thunk';
import {createBrowserHistory} from 'history';
import {createStore, applyMiddleware} from 'redux';
import {routerMiddleware} from 'react-router-redux';

import rootReducer from '../reducers';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState) {
    return createStore(rootReducer, initialState, enhancer);
}

export default {configureStore, history};
