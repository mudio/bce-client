/**
 * Page - Upload Page
 *
 * @file UploadPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Transfer from '../components/transfer/Transfer';

import {TransCategory} from '../utils/BosType';
import {UploadStatus} from '../utils/TransferStatus';

function mapStateToProps(state) {
    return {
        category: TransCategory.Upload,
        uploads: state.uploads.filter(task => task.status !== UploadStatus.Finish)
    };
}

export default connect(mapStateToProps)(Transfer);
