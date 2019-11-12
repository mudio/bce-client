/**
 * Page - SyncDisk Page
 *
 * @file SyncPage.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import {connect} from 'react-redux';
import SyncDisk from '../components/syncdisk/SyncDisk';

function mapStateToProps(state) {
    return state.navigator;
}

export default connect(mapStateToProps)(SyncDisk);
