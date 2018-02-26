/**
 * Uitls - 日志记录器
 *
 * @file Logger.js
 * @author mudio(job.mudio@gmail.com)
 */

import log from 'electron-log';

if (process.type !== 'renderer') {
    // Same as for console transport
    log.transports.file.level = 'warn';
    log.transports.console.level = 'debug';
    // log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

    // Set approximate maximum log size in bytes. When it exceeds,
    // the archived log will be saved as the log.old.log file
    log.transports.file.maxSize = 5 * 1024 * 1024;

    // Write to this file, must be set before first logging
    // log.transports.file.file = __dirname + '/log.txt';

    // fs.createWriteStream options, must be set before first logging
    // you can find more information at
    // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
    // log.transports.file.streamConfig = {
    //     flags: 'w'
    // };

    // set existed file stream
    // log.transports.file.stream = fs.createWriteStream('log.txt');
}

export default log;
