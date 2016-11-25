/**
 * Uitls - File Transfer Command
 *
 * @file TransferCommnad.js
 * @author mudio(job.mudio@gmail.com)
 */

export const _uploadType = 'UploadCommand';

export const UploadCommandType = Symbol.for(_uploadType);

export const UploadNotify = {
    New: 'upload_notify_new',
    Start: 'upload_notify_start',
    Error: 'upload_notify_error',
    Repair: 'upload_notify_repair',
    Finish: 'upload_notify_finish',
    Remove: 'upload_notify_remove',
    Launch: 'upload_notify_Launch',
    Prepare: 'upload_notify_prepare',
    Progress: 'upload_notify_progress',
    ClearFinish: 'upload_notify_clear_finish'
};

export const DownloadNotify = {

};
