/**
 * Utils - Url Parse Class
 *
 * @file URL.js
 * @author mudio(job.mudio@gmail.com)
 */

export default class URL {
    constructor(nav) {
        this.region = nav.region;
        this.bucket = nav.bucket;
        this.folder = nav.folder;
        this.object = nav.object;
    }

    parse(url = '') {
        const paths = url.slice(5).split('/');
        this.region = url.slice(0, 2);
        this.bucket = paths.shift();
        this.object = paths.pop();
        this.folder = paths.join('/');
    }

    toString() {
        return `${this.region}://${this.bucket}${this.object}${this.folder}`;
    }

    getRegion() {
        return this.region;
    }

    getObject() {
        return this.object;
    }

    getFolder() {
        return this.folder;
    }

    getBucket() {
        return this.bucket;
    }
}
