/**
 * MiddleWare - api MiddleWare
 *
 * @file api.js
 * @author mudio(job.mudio@gmail.com)
 */

import {ClientFactory} from '../api/client';
import ErrorCode from '../utils/ErrorCode';

export const API_TYPE = Symbol('Call API');

export default () => next => async action => {
    const callAPI = action[API_TYPE];
    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    const {types, method, args} = callAPI;
    const [bucket] = args;
    if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.');
    }
    if (!types.every(type => typeof type === 'string')) {
        throw new Error('Expected action types to be strings.');
    }

    const [requestType, successType, failureType] = types;
    const _client = await ClientFactory.fromBucket(bucket);

    function actionWith(data) {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[API_TYPE];
        return finalAction;
    }
    next(actionWith({type: requestType}));

    try {
        const response = await _client[method](...args);

        return next(actionWith({type: successType, response}));
    } catch (ex) {
        const {code, message} = ex;

        return next(actionWith({type: failureType, error: ErrorCode[code] || message}));
    }
};
