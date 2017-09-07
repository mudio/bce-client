/**
 * Uitls - File Transfer Command
 *
 * @file TransferCommnad.js
 * @author mudio(job.mudio@gmail.com)
 */

export const _uploadType = 'UploadCommand';
export const UploadCommandType = Symbol.for(_uploadType);

export const _downloadType = 'DownloadCommand';
export const DownloadCommandType = Symbol.for(_downloadType);

export const UploadNotify = {
    New: 'upload_notify_new',
    Boot: 'upload_notify_boot',
    Start: 'upload_notify_start',
    Waiting: 'upload_notify_waiting',
    Error: 'upload_notify_error',
    Remove: 'upload_notify_remove',
    Finish: 'upload_notify_finish',
    FinishPart: 'upload_notify_finish_part',
    Progress: 'upload_notify_progress',
    Pausing: 'upload_notify_pausing',
    Paused: 'upload_notify_paused',
    ClearFinish: 'upload_notify_clear_finish'
};

export const DownloadNotify = {
    New: 'download_notify_new',
    Boot: 'download_notify_boot',
    Start: 'download_notify_start',
    Error: 'download_notify_error',
    Remove: 'download_notify_remove',
    Finish: 'download_notify_finish',
    FinishPart: 'download_notify_finish_part',
    Progress: 'download_notify_progress',
    Pausing: 'download_notify_pausing',
    Paused: 'download_notify_paused',
    ClearFinish: 'download_notify_clear_finish'
};
