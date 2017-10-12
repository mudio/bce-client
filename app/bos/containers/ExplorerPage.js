/**
 * Page - Login Page
 *
 * @file LoginPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Explorer from '../components/Explorer/Explorer';

function mapStateToProps(state) {
    return state.navigator;
}

export default connect(mapStateToProps)(Explorer);
