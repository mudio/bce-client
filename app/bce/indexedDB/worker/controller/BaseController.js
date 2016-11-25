/**
 * Worker - BaseController - 基础控制器
 *
 * @file BaseController.js
 * @author mudio(job.mudio@gmail.com)
 */

import Schema from '../db/Schema';

export default class BaseController extends Schema {

    add(model = {}) {
        this.logger('Execute Add = %s', JSON.stringify(model));
    }

    batchAdd(models = []) {
        this.logger('Execute BatchAdd = %s', JSON.stringify(models));
    }

    update(key = '', model = {}) {
        this.logger('Execute Upldate key = %s, data = %s', key, JSON.stringify(model));
    }

    remove(key = '') {
        this.logger('Execute Remove key = %s', key);
    }

    get(key = '') {
        this.logger('Execute Get key = %s', key);
    }

    getAll() {
        this.logger('Execute GetAll');
    }

    count() {
        this.logger('Execute Count');
    }
}
