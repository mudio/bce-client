/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {deleteObject, migrationObject} from './window';

export function migration(...args) {
    return migrationObject(...args);
}

export function trash(...args) {
    return deleteObject(...args);
}
