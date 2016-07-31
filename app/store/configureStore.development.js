

import thunk from 'redux-thunk';
import api from '../middleware/api';
import rootReducer from '../reducers';
import createLogger from 'redux-logger';
import {hashHistory} from 'react-router';
import {upload} from '../middleware/uploader';
import {download} from '../middleware/downloader';
import {routerMiddleware} from 'react-router-redux';
import {createStore, applyMiddleware, compose} from 'redux';

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
            store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
        );
    }

    return store;
}
