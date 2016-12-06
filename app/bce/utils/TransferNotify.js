/**
 * Uitls - File Transfer Command
 *
 * @file TransferCommnad.js
 * @author mudio(job.mudio@gmail.com)
 */

export const _uploadType = 'UploadCommand';
export const UploadCommandType = Symbol.for(_uploadType);

export const _downloadType = 'DownloadCommand';
export const DownloadType = Symbol.for(_downloadType);

export const UploadNotify = {
    New: 'upload_notify_new',
    Start: 'upload_notify_start',
    Error: 'upload_notify_error',
    Finish: 'upload_notify_finish',
    Remove: 'upload_notify_remove',
    Launch: 'upload_notify_launch',
    Prepare: 'upload_notify_prepare',
    Progress: 'upload_notify_progress',
    Suspended: 'upload_notify_suspended',
    Suspending: 'upload_notify_suspending',
    ClearFinish: 'upload_notify_clear_finish'
};

export const DownloadNotify = {
    New: 'download_notify_new',
    Init: 'download_notify_init',
    Start: 'download_notify_start',
    Error: 'download_notify_error',
    Launch: 'download_notify_launch',
    Remove: 'download_notify_remove',
    Finish: 'download_notify_finish',
    Progress: 'download_notify_progress',
    Suspended: 'download_notify_suspended',
    Suspending: 'download_notify_suspending',
    ClearFinish: 'download_notify_clear_finish'
};
