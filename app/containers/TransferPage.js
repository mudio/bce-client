/**
 * Page - Transfer Page
 *
 * @file TransferPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Transfer from '../components/Transfer/Transfer';
import * as UploaderActons from '../actions/uploader';

function mapStateToProps(state) {
    return {
        uploads: state.uploads,
        downloads: state.downloads
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(UploaderActons, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Transfer);
