/**
 * Utils - 生成UUID
 *
 * @file Uuid.js
 * @author mudio(job.mudio@gmail.com)
 */

import uuid from 'uuid';

export default function getUuid() {
    return uuid.v1();
}
