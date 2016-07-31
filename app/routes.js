/**
 * Base - Redux Route File
 *
 * @file routes.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from './containers/App';
import ExplorerPage from './containers/ExplorerPage';
import LoginPage from './containers/LoginPage';
import TransferPage from './containers/TransferPage';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={LoginPage} />
        <Route path="/region/:region" component={ExplorerPage} />
        <Route path="/transfer/:transType" component={TransferPage} />
        <Route path="/login" component={LoginPage} />
    </Route>
);
