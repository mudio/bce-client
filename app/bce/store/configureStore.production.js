/**
 * Store - Product Store
 *
 * @file configureStore.production.js
 * @author mudio(job.mudio@gmail.com)
 */

import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {hashHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';
import rootReducer from '../reducers';
import api from '../middleware/api';
import {upload} from '../middleware/uploader';
import {download} from '../middleware/downloader';

const router = routerMiddleware(hashHistory);

const enhancer = applyMiddleware(thunk, router, api, upload, download);

export default function configureStore(initialState) {
    return createStore(rootReducer, initialState, enhancer);
}
