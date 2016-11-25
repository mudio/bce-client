/**
 * Uitls - 日志记录器
 *
 * @file Logger.js
 * @author mudio(job.mudio@gmail.com)
 */

import logger from 'debug';

export const debug = logger('bce-client:debug');
export const info = logger('bce-client:info');
export const warn = logger('bce-client:warn');
export const error = logger('bce-client:error');

export const mainLogger = logger('bce-client:main');
export const renderLogger = logger('bce-client:render');
export const workerLogger = logger('bce-client:worker');
