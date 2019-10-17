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

    const {region, types, method, args} = callAPI;
    if (!Array.isArray(types) || types.length !== 3) {
        throw new Error('Expected an array of three action types.');
    }
    if (!types.every(type => typeof type === 'string')) {
        throw new Error('Expected action types to be strings.');
    }

    const [requestType, successType, failureType] = types;
    const _client = region
        ? await ClientFactory.fromRegion(region)
        : await ClientFactory.fromBucket(args[0]);

    function actionWith(data) {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[API_TYPE];
        return finalAction;
    }
    next(actionWith({type: requestType, args}));

    try {
        const response = await _client[method](...args);

        return next(actionWith({type: successType, response}));
    } catch (ex) {
        return next(actionWith({type: failureType, error: ErrorCode[ex.code] || ex}));
    }
};
