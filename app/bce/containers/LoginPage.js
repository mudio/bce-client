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

function mapStateToProps({auth, login}) {
    return {...auth, ...login};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(LoginActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

