/**
 * Uitls - 通用工具
 *
 * @file utils.js
 * @author mudio(job.mudio@gmail.com)
 */

import moment from 'moment';
import humanize from 'humanize';

/**
 * 格式化速率
 *
 * @param {number} bytesSize 每秒吞吐量
 */
export const humenRate = (kbs = 0) => `${humanize.filesize(kbs)}/s`;

/**
 * 显示文件大小
 *
 * @param {number} bytesSize
 */
export const humanSize = (bytesSize = 0) => humanize.filesize(bytesSize);

/**
 * UTC 时间转换成本地时间
 *
 * @param {String} utcTime
 * @return {String} localTime
 */
export const utcToLocalTime = (utcTime) => moment(utcTime).format('YYYY-MM-DD HH:mm:ss');

/**
 * 判断是否是`OSX`
 */
export const isOSX = process.platform === 'darwin';

/**
 * 判断是否是`Window`
 */
export const isWin = process.platform === 'win32';
