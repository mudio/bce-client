/**
 * Page - Login Page
 *
 * @file LoginPage.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import Explorer from '../components/explorer/Explorer';

function mapStateToProps(state) {
    return Object.assign({}, state.navigator, {syncdisk: state.syncdisk});
}

export default connect(mapStateToProps)(Explorer);
