/**
 * Action - Transfer Action & Creater
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {UploadNotify, DownloadNotify} from '../utils/TransferNotify';

export function clearFinish() {
    return dispatch => {
        dispatch({type: UploadNotify.ClearFinish});
        dispatch({type: DownloadNotify.ClearFinish});
    };
}

export function todo() {

}
