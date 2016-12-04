/**
 * Uitls - File Transfer Status
 *
 * @file TransferStatus.js
 * @author mudio(job.mudio@gmail.com)
 */

export const UploadStatus = {
    Error: 'upload_error',
    Finish: 'upload_finish',
    Staring: 'upload_staring',
    Waiting: 'upload_waiting',
    Running: 'upload_running',
    Suspend: 'upload_suspend',
    Removing: 'upload_removing',
    Indexing: 'upload_indexing',
    Unstarted: 'upload_unstarted',
    Suspended: 'upload_suspended',
    Suspending: 'upload_suspending'
};

const uploadStatusTextMap = {
    [UploadStatus.Error]: '错误',
    [UploadStatus.Finish]: '已完成',
    [UploadStatus.Staring]: '启动中',
    [UploadStatus.Waiting]: '等待中',
    [UploadStatus.Running]: '运行中',
    [UploadStatus.Suspend]: '已暂停',
    [UploadStatus.Removing]: '删除中',
    [UploadStatus.Indexing]: '索引中',
    [UploadStatus.Unstarted]: '未开始',
    [UploadStatus.Suspended]: '已暂停',
    [UploadStatus.Suspending]: '暂停中'
};

export const DownloadStatus = {
    Init: 'download_init',
    Error: 'download_error',
    Finish: 'download_finish',
    Waiting: 'download_waiting',
    Running: 'download_running',
    Unstarted: 'download_unstarted'
};

const downloadStatusTextMap = {
    [DownloadStatus.Init]: '初始化中',
    [DownloadStatus.Error]: '下载错误',
    [DownloadStatus.Finish]: '下载完成',
    [DownloadStatus.Waiting]: '等待下载',
    [DownloadStatus.Running]: '下载中',
    [DownloadStatus.Unstarted]: '未开始'
};

export function getText(code) {
    return uploadStatusTextMap[code] || downloadStatusTextMap[code] || code;
}
