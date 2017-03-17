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
    type: UPDATE_NOT_AVAILABLE,
    version: remote.app.getVersion(),
    lastest: {
        name: remote.app.getVersion()
    }
};

export default function updater(state = defaultState, action) {
    switch (action.type) {
    case UPDATE_ERROR:
    case UPDATE_CHECKING:
    case UPDATE_AVAILABLE:
    case UPDATE_DOWNLOADED:
    case UPDATE_NOT_AVAILABLE:
        return Object.assign({}, state, {
            type: action.type,
            lastest: action.message
        });
    default:
        return state;
    }
}
