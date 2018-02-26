/**
 * Uitls - 通用工具
 *
 * @file utils.js
 * @author mudio(job.mudio@gmail.com)
 */

import moment from 'moment';

/**
 * 格式化速率
 *
 * @param {number} bytesSize 每秒吞吐量
 */
export const humenRate = (kbs = 0) => {
    if (kbs < 1000) {
        return `${kbs.toFixed(2)} KB/s`;
    }

    return `${(kbs / 1024).toFixed(2)} MB/s`;
};

/**
 * 显示文件大小
 *
 * @param {number} bytesSize
 */
export const humanSize = (bytesSize = 0) => {
    const unitKB = 1024;
    const unitMB = 1024 * 1024;
    const unitGB = 1024 * 1024 * 1024;

    if (bytesSize >= unitGB) {
        return `${(bytesSize / unitGB).toFixed(0)}GB`;
    } else if (bytesSize >= unitMB && bytesSize < unitGB) {
        return `${(bytesSize / unitMB).toFixed(0)}MB`;
    } else if (bytesSize >= unitKB && bytesSize < unitMB) {
        return `${(bytesSize / unitKB).toFixed(0)}KB`;
    }

    return `${(bytesSize / 1024).toFixed(2)}KB`;
};

/**
 * UTC 时间转换成本地时间
 *
 * @param {String} utcTime
 * @return {String} localTime
 */
export const utcToLocalTime = (utcTime) => moment(utcTime).format('YYYY-MM-DD HH:mm:ss');
