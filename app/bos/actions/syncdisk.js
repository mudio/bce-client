/**
 * Action - SyncDisk Action & Creater
 *
 * @file syncdisk.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

export const SYNCDISK_NEW_MAPPING = 'SYNCDISK_NEW_MAPPING';

/**
 * 变更新建映射关系状态
 *
 * @export
 * @param {any} visible
 * @returns
 */
export function toggleNewMapping(visible) {
    return {type: SYNCDISK_NEW_MAPPING, visible};
}

export const SYNCDISK_CHANGE_LOCALPATH = 'SYNCDISK_CHANGE_LOCALPATH';

/**
 * 改变本地盘的路径
 *
 * @export
 * @param {any} path
 * @returns
 */
export function changeLocalPath(path) {
    return {type: SYNCDISK_CHANGE_LOCALPATH, path};
}

export const SYNCDISK_CHANGE_BOSPATH = 'SYNCDISK_CHANGE_BOSPATH';

/**
 * 改变BOS路径
 *
 * @export
 * @param {any} path
 * @returns
 */
export function changeBosPath(path) {
    return {type: SYNCDISK_CHANGE_BOSPATH, path};
}

export const SYNCDISK_CHANGE_NEWMAPPING = 'SYNCDISK_CHANGE_NEWMAPPING';

export const SYNCDISK_CHANGE_DELETEMAPPING = 'SYNCDISK_CHANGE_DELETEMAPPING';

export const SYNCDISK_CHANGE_MAPPING = 'SYNCDISK_CHANGE_MAPPING';

export const SYNCDISK_CHANGE_SIGNAL = 'SYNCDISK_CHANGE_SIGNAL';
