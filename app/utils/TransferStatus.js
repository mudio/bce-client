/**
 * Uitls - File Transfer Status
 *
 * @file TransferStatus.js
 * @author mudio(job.mudio@gmail.com)
 */

export const TRANS_WATING = 'TRANS_WATING';
export const TRANS_RUNNING = 'TRANS_RUNNING';
export const TRANS_FINISH = 'TRANS_FINISH';
export const TRANS_SUSPEND = 'TRANS_SUSPEND';

export function getText(code) {
    switch (code) {
    case TRANS_WATING:
        return '等待中';
    case TRANS_RUNNING:
        return '传输中';
    case TRANS_FINISH:
        return '已完成';
    case TRANS_SUSPEND:
        return '暂停中';
    default:
        return code;
    }
}
