/**
 * Action - Processing Reducer
 *
 * @file processing.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import {
    LIST_OBJECT_SUCCESS, LIST_OBJECT_FAILURE,
    COPY_OBJECT_REQUEST, COPY_OBJECT_SUCCESS, COPY_OBJECT_FAILURE
} from '../actions/window';

const defaultState = {
    // 文件集合，包含处理中和处理完成的文件
    processObjects: [],
    // 文件集合，存放处理完成的文件
    processedObjects: []
};

export default function processing(state = defaultState, action) {
    switch (action.type) {
    case COPY_OBJECT_REQUEST: {
        const object = action.args[1];
        state.processObjects.push(object);
        return Object.assign({}, state, {processObjects: [...state.processObjects]});
    }
    case COPY_OBJECT_SUCCESS: {
        const object = action.response.body;
        state.processedObjects.push(object);
        return Object.assign({}, state, {processedObjects: [...state.processedObjects]});
    }
    //  任务失败的话也需要清空任务进度
    case LIST_OBJECT_SUCCESS:
    case LIST_OBJECT_FAILURE:
    case COPY_OBJECT_FAILURE: {
        return Object.assign({}, state, {
            processObjects: [],
            processedObjects: []
        });
    }
    default:
        return state;
    }
}
