/**
 * MiddleWare - api MiddleWare
 *
 * @file api.js
 * @author mudio(job.mudio@gmail.com)
 */

import ErrorCode from './ErrorCode';
import {getRegionClient} from '../api/client';

export const API_TYPE = Symbol('Call API');

export default () => next => action => {
    const callAPI = action[API_TYPE];
    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    const {types, method, args} = callAPI;
    if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.');
    }
    if (!types.every(type => typeof type === 'string')) {
        throw new Error('Expected action types to be strings.');
    }

    const [requestType, successType, failureType] = types;
    const client = getRegionClient();

    function actionWith(data) {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[API_TYPE];
        return finalAction;
    }
    next(actionWith({type: requestType}));

    return client[method](...args).then(
        response => next(actionWith({
            response,
            type: successType
        })),
        error => next(actionWith({
            type: failureType,
            error: ErrorCode[error.code] || error.message
        }))
    );
};
