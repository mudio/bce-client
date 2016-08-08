/**
 * Action - Navigator Reducer
 *
 * @file navigator.js
 * @author mudio(job.mudio@gmail.com)
 */

import {UPDATE_NAV} from '../actions/explorer';
import {REGION_BJ} from '../utils/Region';

const defalutState = {region: REGION_BJ, bucket: '', folder: ''};

export default function region(state = defalutState, action) {
    switch (action.type) {
    case UPDATE_NAV:
        return Object.assign({}, state, action.nav);
    default:
        return state;
    }
}
