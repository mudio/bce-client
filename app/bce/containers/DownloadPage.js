/**
 * Page - Download Page
 *
 * @file DownloadPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Transfer from '../components/Transfer/Transfer';

import {TransCategory} from '../utils/BosType';
import {DownloadStatus} from '../utils/TransferStatus';

function mapStateToProps(state) {
    return {
        category: TransCategory.Download,
        downloads: state.downloads.filter(task => task.status !== DownloadStatus.Finish)
    };
}

export default connect(mapStateToProps)(Transfer);
