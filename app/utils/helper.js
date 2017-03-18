/**
 * utils - helper
 *
 * @file helper.js
 * @author mudio(job.mudio@gmail.com)
 */

import uuid from 'uuid';

export const isDev = process.env.NODE_ENV === 'development';

export const getUuid = () => uuid.v1();
