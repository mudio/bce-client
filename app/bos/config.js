/**
 * Uitls - File Transfer Config
 *
 * @file TransferConfig.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-multi-spaces: 0 */

export const UploadConfig = {
    MetaLimit: 5,               // 最多跑五个任务
    RateLimit: 200,             // kb/s 暂不支持
    PartLimit: 2,               // 最高并行片数
    PartSize: 5 * 1024 * 1024   // 5MB
};

export const DownloadConfig = {
    MetaLimit: 5,               // 最多跑五个任务
    PartLimit: 4,               // 最高并行片数
    PartSize: 5 * 1024 * 1024   // 5MB
};
