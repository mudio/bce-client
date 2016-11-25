/**
 * Page - Transfer Page
 *
 * @file TransferPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Transfer from '../components/Transfer/Transfer';

function mapStateToProps(state) {
    return {
        uploads: state.uploads,
        downloads: state.downloads
    };
}

export default connect(mapStateToProps)(Transfer);
