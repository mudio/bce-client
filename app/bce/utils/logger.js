/**
 * Uitls - 日志记录器
 *
 * @file Logger.js
 * @author mudio(job.mudio@gmail.com)
 */

import logger from 'electron-log';

// Log level
logger.transports.console.level = 'info';

export default logger;
