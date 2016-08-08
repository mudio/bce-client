/**
 * Page - Login Page
 *
 * @file LoginPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Login from '../components/Login';
import * as LoginActions from '../actions/login';

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(LoginActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

