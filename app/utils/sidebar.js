/**
 * Uitls - Sidebar Config
 *
 * @file sidebar.js
 * @author mudio(job.mudio@gmail.com)
 */

import {regions, getLocalText} from './region';
import {TransUploadType, TransDownloadType} from './BosType';

const regionItems = regions.map(r => ({
    text: getLocalText(r),
    hash: `/region/${r}`,
    className: 'fa fa-map-marker'
}));

export default regionItems.concat([
    {
        text: '下载队列',
        hash: `/transfer/${TransDownloadType}`,
        className: 'fa fa-download'
    },
    {
        text: '上传队列',
        hash: `/transfer/${TransUploadType}`,
        className: 'fa fa-upload'
    },
    {
        text: '操作日志',
        hash: '/log',
        className: 'fa fa-book'
    }
]);

