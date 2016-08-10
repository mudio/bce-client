/**
 * Main Process - Windows自动更新
 *
 * @file WIN32Updater.js
 * @author mudio(job.mudio@gmail.com)
 */

import {app} from 'electron';
import {spawn} from 'child_process';
import path from 'path';

export default class WIN32Updater {
    run(args, done) {
        const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
        console.log('Spawning `%s` with args `%s`', updateExe, args); // eslint-disable-line no-console

        spawn(updateExe, args, {detached: true}).on('close', done);
    }

    startUp() {
        if (process.platform !== 'win32') {
            return;
        }

        const cmd = process.argv[1];
        const target = path.basename(process.execPath);

        console.log('Processing squirrel command `%s`', cmd); // eslint-disable-line no-console

        if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
            this.run([`--createShortcut=${target}`], app.quit);
        } else if (cmd === '--squirrel-uninstall') {
            this.run([`--removeShortcut=${target}`], app.quit);
        } else if (cmd === '--squirrel-obsolete') {
            app.quit();
        }
    }
}
