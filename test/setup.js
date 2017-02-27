/* eslint import/no-extraneous-dependencies: 0 */

import {jsdom} from 'jsdom';

const _storage = {
    getItem(key) {
        return this[key];
    },
    setItem(key, value) {
        this[key] = value;
    },
    removeItem(key) {
        this[key] = undefined;
    },
};

window.localStorage = _storage;
window.sessionStorage = _storage;
global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;
