/**
 * Action - Updater Reducer
 *
 * @file updater.js
 * @author mudio(job.mudio@gmail.com)
 */

import {remote} from 'electron';

import {
    UPDATE_ERROR,
    UPDATE_CHECKING,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_NOT_AVAILABLE
} from '../actions/updater';

const defaultState = {
    version: remote.app.getVersion(),
    lastUpdateTime: (new Date()).toString(),
    note: '当前最新版本'
};

export default function updater(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_ERROR:
    case UPDATE_CHECKING:
    case UPDATE_AVAILABLE:
    case UPDATE_DOWNLOADED:
    case UPDATE_NOT_AVAILABLE:
        return Object.assign({}, state, {
            lastUpdateTime: (new Date()).toString(),
            note: action.message
        });
    default:
        return state;
    }
}
