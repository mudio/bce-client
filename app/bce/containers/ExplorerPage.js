/**
 * Page - Login Page
 *
 * @file LoginPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Explorer from '../components/Explorer/Explorer';
import * as ExplorerActons from '../actions/explorer';

function mapStateToProps(state) {
    return {
        nav: state.navigator
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ExplorerActons, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Explorer);
