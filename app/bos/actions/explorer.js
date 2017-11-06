/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

export const EXPLORER_SYNC_LAYOUT = 'EXPLORER_SYNC_LAYOUT';

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
