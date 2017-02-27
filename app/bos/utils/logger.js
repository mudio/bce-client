/**
 * Uitls - 日志记录器
 *
 * @file Logger.js
 * @author mudio(job.mudio@gmail.com)
 */

import logger from 'electron-log';

import {isDev} from './utils';

// Log level
logger.transports.console.level = 'info';

logger.transports.file = !isDev();
logger.transports.console = isDev();
