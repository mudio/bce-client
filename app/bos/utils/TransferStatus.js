/**
 * Uitls - File Transfer Status
 *
 * @file TransferStatus.js
 * @author mudio(job.mudio@gmail.com)
 */

export const UploadStatus = {
    Error: 'upload_error',
    Finish: 'upload_finish',
    Waiting: 'upload_waiting',
    Running: 'upload_running',
    Paused: 'upload_paused'
};

const uploadStatusTextMap = {
    [UploadStatus.Error]: '错误',
    [UploadStatus.Finish]: '上传完成',
    [UploadStatus.Waiting]: '等待中',
    [UploadStatus.Running]: '运行中',
    [UploadStatus.Paused]: '已暂停'
};

export const DownloadStatus = {
    Error: 'download_error',
    Finish: 'download_finish',
    Waiting: 'download_waiting',
    Running: 'download_running',
    Paused: 'download_paused'
};

const downloadStatusTextMap = {
    [DownloadStatus.Error]: '下载错误',
    [DownloadStatus.Finish]: '下载完成',
    [DownloadStatus.Waiting]: '等待下载',
    [DownloadStatus.Running]: '下载中',
    [DownloadStatus.Paused]: '已暂停'
};

export function getText(code) {
    return uploadStatusTextMap[code] || downloadStatusTextMap[code] || code;
}
