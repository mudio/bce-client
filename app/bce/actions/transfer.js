/**
 * Action - Transfer Action & Creater
 *
 * @file transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {TransCategory} from '../utils/BosType';
import {UploadNotify, DownloadNotify} from '../utils/TransferNotify';

export function clearFinish(transType) {
    if (transType === TransCategory.Upload) {
        return {type: UploadNotify.ClearFinish};
    }

    return {type: DownloadNotify.ClearFinish};
}

export function todo() {

}
