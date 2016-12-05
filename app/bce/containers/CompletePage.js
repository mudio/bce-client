/**
 * Page - Complete Page
 *
 * @file CompletePage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Transfer from '../components/Transfer/Transfer';

import {TransCategory} from '../utils/BosType';
import {DownloadStatus, UploadStatus} from '../utils/TransferStatus';

function mapStateToProps(state) {
    return {
        category: TransCategory.Complete,
        uploads: state.uploads.filter(task => task.status !== UploadStatus.Finish),
        downloads: state.downloads.filter(task => task.status !== DownloadStatus.Finish)
    };
}

export default connect(mapStateToProps)(Transfer);
