/**
 * Action - Selection Action & Creater
 *
 * @file Selection.js
 * @author mudio(job.mudio@gmail.com)
 */

export const MENU_COPY_COMMAND = Symbol('Copy');
export const MENU_MOVE_COMMAND = Symbol('Move');
export const MENU_VIEW_COMMAND = Symbol('View');
export const MENU_SHARE_COMMAND = Symbol('Share');
export const MENU_RENAME_COMMAND = Symbol('Rename');
export const MENU_DOWNLOAD_COMMAND = Symbol('Download');
export const MENU_TRASH_COMMAND = Symbol('Trash');
export const MENU_UPLOAD_COMMAND = Symbol('Upload');
export const MENU_REFRESH_COMMAND = Symbol('Refresh');
export const MENU_UPLOAD_DIRECTORY_COMMAND = Symbol('Directory');
export const MENU_NEW_DIRECTORY_COMMAND = Symbol('Path');

export const commandMap = {
    [MENU_UPLOAD_COMMAND]: {name: '上传', icon: 'cloud-upload', command: MENU_UPLOAD_COMMAND},
    [MENU_UPLOAD_DIRECTORY_COMMAND]: {name: '上传目录', icon: 'cloud-upload', command: MENU_UPLOAD_DIRECTORY_COMMAND},
    [MENU_REFRESH_COMMAND]: {name: '刷新', icon: 'refresh', command: MENU_REFRESH_COMMAND},
    [MENU_COPY_COMMAND]: {name: '复制到', icon: 'copy', command: MENU_COPY_COMMAND},
    [MENU_TRASH_COMMAND]: {name: '删除', icon: 'trash', command: MENU_TRASH_COMMAND},
    [MENU_SHARE_COMMAND]: {name: '分享', icon: 'chain', command: MENU_SHARE_COMMAND},
    [MENU_MOVE_COMMAND]: {name: '移动到', icon: 'arrows', command: MENU_MOVE_COMMAND},
    [MENU_VIEW_COMMAND]: {name: '查看', icon: 'eye', command: MENU_VIEW_COMMAND},
    [MENU_RENAME_COMMAND]: {name: '重命名', icon: 'pencil', command: MENU_RENAME_COMMAND},
    [MENU_DOWNLOAD_COMMAND]: {name: '下载', icon: 'cloud-download', command: MENU_DOWNLOAD_COMMAND},
    [MENU_NEW_DIRECTORY_COMMAND]: {name: '新建文件夹', icon: 'plus', command: MENU_NEW_DIRECTORY_COMMAND}
};
