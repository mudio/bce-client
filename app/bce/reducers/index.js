/**
 * Action - Index Reducer
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';

import auth from './login';
import update from './updater';
import explorer from './explorer';
import navigator from './navigator';
import {downloads, uploads} from './transfer';

const rootReducer = combineReducers({
    auth,
    uploads,
    routing,
    explorer,
    navigator,
    downloads,
    update
});

export default rootReducer;
