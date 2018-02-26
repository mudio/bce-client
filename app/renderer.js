/**
 * Base - Render Root File
 *
 * @file renderer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {error} from './utils/logger';

import './bce/style/mixin.global.css';
import './bos/style/mixin.global.css';

import renderBosPage from './bos/index';
import renderLoginPage from './bce/index';

if (/login.html$/.test(window.location.pathname)) {
    // 登陆
    renderLoginPage(document.getElementById('main'));
} else if (/app.html$/.test(window.location.pathname)) {
    // 首页
    renderBosPage(document.getElementById('main'));
}

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();

process.on('uncaughtException', ex => error(ex.message));
