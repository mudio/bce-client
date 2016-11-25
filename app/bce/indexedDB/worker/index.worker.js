/**
 * Worker - Web Worker 入口
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import UploadController from './controller/UploadController';

self.uploadController = new UploadController();

self.onmessage = evt => {
    const {uuid, message} = JSON.parse(evt.data);
    const {data, type} = message;

    if (type) {
        if (type in self.uploadController) {
            self.uploadController[type](data).then(
                taskId => self.postMessage(
                    JSON.stringify({uuid, success: true, message: taskId})
                ),
                err => self.postMessage(
                    JSON.stringify({uuid, success: false, message: err.message})
                )
            );
        }
    } else {
        return self.postMessage(
            JSON.stringify({notify: true, message: ['Invoke invalid method %s', type]})
        );
    }
};
