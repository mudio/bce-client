/**
 * Action - Navigator Reducer
 *
 * @file navigator.js
 * @author mudio(job.mudio@gmail.com)
 */

import {UPDATE_NAV} from '../actions/navigator';
import {REGION_BJ} from '../../utils/region';

const defalutState = {region: REGION_BJ, bucket: '', prefix: ''};

export default function navigator(state = defalutState, action) {
    const {type, region = state.region, bucket, prefix} = action;

    switch (type) {
    case UPDATE_NAV:
        return Object.assign({}, state, {region, bucket, prefix});
    default:
        return state;
    }
}
