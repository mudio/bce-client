/**
 * Store - store entry
 *
 * @file Store.js
 * @author mudio(job.mudio@gmail.com)
 */

import {isDev} from '../utils/utils';

if (isDev) {
    module.exports = require('./configureStore.development'); // eslint-disable-line global-require
} else {
    module.exports = require('./configureStore.production'); // eslint-disable-line global-require
}
