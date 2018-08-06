/**
 * Base - Render Root File
 *
 * @file renderer.js
 * @author mudio(job.mudio@gmail.com)
 */

import './bce/style/mixin.global.css';
import './bos/style/mixin.global.css';

import {error} from './utils/logger';
import BOSBootstrap from './bos/index';
import BceBootstrap from './bce/index';

const container = document.getElementById('main');

if (location.search.startsWith('?login')) { // eslint-disable-line no-restricted-globals
    BceBootstrap.startup(container);
} else {
    BOSBootstrap.startup(container);
}

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();

process.on('uncaughtException', ex => error(ex.message));
