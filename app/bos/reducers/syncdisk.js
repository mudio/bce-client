/**
 * Action - SyncDisk Reducer
 *
 * @file syncdisk.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import u from 'underscore';
import {
    SYNCDISK_NEW_MAPPING,
    SYNCDISK_CHANGE_LOCALPATH,
    SYNCDISK_CHANGE_BOSPATH,
    SYNCDISK_CHANGE_NEWMAPPING,
    SYNCDISK_CHANGE_MAPPING,
    SYNCDISK_CHANGE_DELETEMAPPING
} from '../actions/syncdisk';
import {clearLog, stopSync} from '../sync/index';

const defaultState = {
    //  是否显示新建同步盘映射
    visible: false,
    //  当前映射的BOS路径
    bosPath: '',
    //  本地盘路径
    localPath: '',
    //  任务列表
    mappings: []
};

export default function explorer(state = defaultState, action) {
    const {mappings} = state;
    let index = -1;
    switch (action.type) {
    case SYNCDISK_NEW_MAPPING:
        return Object.assign({}, state, {visible: !action.visible});

    case SYNCDISK_CHANGE_LOCALPATH:
        return Object.assign({}, state, {localPath: action.path});

    case SYNCDISK_CHANGE_BOSPATH:
        return Object.assign({}, state, {bosPath: action.path});

    case SYNCDISK_CHANGE_NEWMAPPING:
        mappings.push(action.mapping);
        return Object.assign({}, state, {mappings, visible: false});

    case SYNCDISK_CHANGE_MAPPING:
        index = u.findIndex(mappings, item => item.uuid === action.mapping.uuid);
        mappings.splice(index, 1, action.mapping);
        return Object.assign({}, state, {mappings: [...mappings]});

    case SYNCDISK_CHANGE_DELETEMAPPING:
        return Object.assign({}, state, {
            mappings: mappings.filter((value, i) => {
                if (action.indexs.indexOf(i) === -1) {
                    return true;
                }
                clearLog(value.uuid);
                return false;
            })
        });
    default:
        return state;
    }
}
