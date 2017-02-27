/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {render} from 'react-dom';

import './style/mixin.global.css';
import bosBootstrap from '../bos/index';
import Extensions from './components/Extensions';

const extensions = document.getElementById('extensions');
const main = document.getElementById('main');

bosBootstrap(main);
render(<Extensions />, extensions);

document.body.onkeypress = ({code, target}) => {
    if (target.tagName === 'INPUT') {
        return;
    }

    if (code === 'Backquote' && extensions.className.indexOf('fadeIn') === -1) {
        extensions.className = 'fadeIn';
    } else {
        extensions.className = 'fadeOut';
    }
};

document.body.ondrop = evt => evt.preventDefault();
document.body.ondragover = evt => evt.preventDefault();

