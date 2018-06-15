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

import api from '../middleware/api';
import upload from '../middleware/uploader';
import download from '../middleware/downloader';

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router, api, upload, download);

function configureStore(initialState) {
    return createStore(rootReducer, initialState, enhancer);
}

export default {configureStore, history};
