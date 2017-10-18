/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {deleteObject, migrationObject} from './window';

export const EXPLORER_SYNC_LAYOUT = 'EXPLORER_SYNC_LAYOUT';

export function migration(...args) {
    return migrationObject(...args);
}

export function trash(...args) {
    return deleteObject(...args);
}

/**
 * 同步页面布局
 *
 * @export
 * @param {any} layout
 * @returns
 */
export function syncLayout(layout) {
    return {type: EXPLORER_SYNC_LAYOUT, layout};
}
