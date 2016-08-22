/**
 * Action - Transfer Action & Creater
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

export const TRANS_CLEAR_FINISH = 'TRANS_CLEAR_FINISH';

export function clearFinish(transType) {
    return {type: TRANS_CLEAR_FINISH, transType};
}
