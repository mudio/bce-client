/**
 * Worker - Database - IndexedDB封装
 *
 * @file DB.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

export default class BaseController {
    constructor(dbName, schemaVersion) {
        this._dbName = dbName;
        this.logger = (...args) => {
            const meesage = JSON.stringify({notify: true, message: [...args]});
            self.postMessage(meesage);
        };

        this._asyncDB = new Promise((resolve, reject) => {
            this._DB = indexedDB.open(dbName, schemaVersion);

            this._DB.onblocked = evt => {
                this.onBlocked(evt);
                reject(evt);
            };

            this._DB.onerror = evt => {
                this.onError(evt);
                reject(evt);
            };

            this._DB.onupgradeneeded = evt => this.onUpgradeNeeded(evt);

            this._DB.onsuccess = evt => {
                this.onSuccess(evt);
                resolve(evt.target.result);
            };
        });
    }

    onBlocked() {
        this.logger('Database %s Blocked!', this._dbName);
    }

    onError(evt) {
        this.logger('Database %s Error, Code = %s', this._dbName, evt.target.errorCode);
    }

    onUpgradeNeeded(evt) {
        const {oldVersion, newVersion} = evt;
        this.logger('Database %s Upgrade version %s to %s!', this._dbName, oldVersion, newVersion);
    }

    onSuccess() {
        this.logger('Database %s Opened!', this._dbName);
    }

    getIdbAsync(callback = () => {}) {
        return this._asyncDB.then(
            callback,
            err => this.logger('Get Database %s Instance Error = %s', this._dbName, err)
        );
    }
}
