/**
 * Base - Redux Route File
 *
 * @file routes.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './containers/App';
import UploadPage from './containers/UploadPage';
import DownloadPage from './containers/DownloadPage';
import CompletePage from './containers/CompletePage';
import ExplorerPage from './containers/ExplorerPage';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={ExplorerPage} />
        <Route path="/region" component={ExplorerPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/download" component={DownloadPage} />
        <Route path="/complete" component={CompletePage} />
    </Route>
);
