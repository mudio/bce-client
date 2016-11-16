/**
 * Action - Explorer Action & Creater
 *
 * @file explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {createDownloadTask} from './downloader';
import {deleteObject, updateNavigator as redirect} from './window';

export function updateNavigator(...args) {
    return redirect(...args);
}

export function copy() {

}

export function move() {

}

export function view() {

}

export function share() {

}

export function rename() {

}

export function download(...args) {
    return createDownloadTask(...args);
}

export function trash(...args) {
    return deleteObject(...args);
}
