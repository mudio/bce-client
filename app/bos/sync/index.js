/**
* @file 同步盘处理主入口
* @author helianthuswhite(hyz19906229@gmail.com)
*/

import u from 'underscore';
import moment from 'moment';
import {notification} from 'antd';

import SyncLogger from './SyncLogger';
import SyncProcesser from './SyncProcesser';
import {ClientFactory} from '../api/client';
import {SYNCDISK_CHANGE_MAPPING} from '../actions/syncdisk';

const processers = {};

async function _getMixinTask(task) {
    const {bosPath} = task;
    const bucket = bosPath.split('/')[0];
    const prefix = bosPath.substring(bucket.length + 1);
    const client = await ClientFactory.fromBucket(bucket);
    const records = await client.listAllObjects(bucket, prefix);
    return Object.assign({}, task, {records, prefix, bucketName: bucket});
}

export const startSync = async uuid => {
    const {mappings} = window.globalStore.getState().syncdisk;
    const rawTask = u.find(mappings, item => item.uuid === uuid);
    const taskIndex = u.findIndex(mappings, item => item.uuid === uuid);
    try {
        const task = await _getMixinTask(rawTask);
        const throttled = u.throttle(() => {
            const mapping = Object.assign({}, rawTask, {syncTime: moment().format('YYYY-MM-DD HH:mm:ss')});
            window.globalStore.dispatch({type: SYNCDISK_CHANGE_MAPPING, mapping});
        }, 300);

        processers[uuid] = new SyncProcesser(task);
        processers[uuid].on('finish', throttled);
        processers[uuid].walkFolder();
        processers[uuid].watchFolder();
    } catch (error) {
        stopSync(uuid);
        const mapping = Object.assign({}, rawTask, {status: 'paused'});
        window.globalStore.dispatch({type: SYNCDISK_CHANGE_MAPPING, mapping});

        const logger = new SyncLogger(rawTask.localPath);
        const description = error
            ? error.message || error
            : '未知错误';
        notification.error({message: `同步盘${taskIndex + 1}启动失败：`, description});
        logger.error(description);
    }
};

export const stopSync = uuid => {
    if (processers[uuid]) {
        processers[uuid].kill();
    }
};

export const clearLog = uuid => {
    if (processers[uuid]) {
        processers[uuid].clearLog();
    }
}
