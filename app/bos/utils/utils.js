/**
 * Uitls - utils
 *
 * @file utils.js
 * @author mudio(job.mudio@gmail.com)
 */

import uuid from 'uuid';

export const isDev = process.env.NODE_ENV === 'development';

export function getUuid() {
    return uuid.v1();
}
