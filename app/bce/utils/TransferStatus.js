/**
 * Uitls - File Transfer Status
 *
 * @file TransferStatus.js
 * @author mudio(job.mudio@gmail.com)
 */

export const UploadStatus = {
    Indexing: 'Indexing',
    Unstarted: 'Unstarted',
    Staring: 'Staring',
    Waiting: 'Waiting',
    Running: 'Running',
    Suspend: 'Suspend',
    Removing: 'Removing',
    Finish: 'Finish',
    Error: 'Error'
};

export function getText(code) {
    switch (code) {
    case UploadStatus.Indexing:
        return '索引中';
    case UploadStatus.Unstarted:
        return '未开始';
    case UploadStatus.Staring:
        return '启动中';
    case UploadStatus.Waiting:
        return '等待中';
    case UploadStatus.Running:
        return '运行中';
    case UploadStatus.Finish:
        return '已完成';
    case UploadStatus.Suspend:
        return '已暂停';
    case UploadStatus.Error:
        return '错误';
    default:
        return code;
    }
}
