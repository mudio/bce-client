/**
 * Main Process - 用户凭证管理，目前ak、sk记录在localstorage中，安全性低
 *
 * @file AutoSignIn.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import keytar from 'keytar';
import {ipcRenderer} from 'electron';

const SERVICE_NAME = 'org.baidu.bce';
const LOGIN_NAME = 'baidu_bce';

export default class AutoSignIn {
    getCredentials() {
        const auth = keytar.getPassword(SERVICE_NAME, LOGIN_NAME);

        if (auth) {
            try {
                const {ak, sk, pin} = JSON.parse(auth); // eslint-disable-line no-unused-vars
                ipcRenderer.send('log.error', 'Incorrect credentials data, see keychain');
            } catch (e) {
                ipcRenderer.send('log.error', e);
            }
        }
    }
}
