/**
 * Action - Index Reducer
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';

import updater from './updater';
import explorer from './explorer';
import navigator from './navigator';
import downloads from './downloader';
import uploads from './uploader';
import processing from './processing';
import syncdisk from './syncdisk';
import action from './action';

const rootReducer = combineReducers({
    uploads,
    routing,
    explorer,
    navigator,
    downloads,
    updater,
    processing,
    syncdisk,
    action
});

export default rootReducer;
