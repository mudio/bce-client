/**
 * client publisher: 发布程序到BOS上
 *
 * @file bosPubliser.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable max-len, no-console */

import fs from 'fs';
import path from 'path';
import walk from 'fs-walk';
import yaml from 'js-yaml';
import {BosClient} from 'bce-sdk-js';

import buildPackage from '../package.json';
import appPackage from '../static/package.json';

const {version, name} = appPackage;
const {BOS_AK, BOS_SK, BOS_ENDPOINT} = process.env;

const bucket = 'bce-bos-client';
const prefix = `releases/v${appPackage.version}`;

const client = new BosClient({
    credentials: {
        ak: BOS_AK,
        sk: BOS_SK
    },
    endpoint: BOS_ENDPOINT
});

function upload(dir, filename, object, buffer) {
    client.getObjectMetadata(bucket, object)
        .then(
            () => console.log(`取消，已经存在 => ${object}`),
            err => {
                if (err.status_code === 404) {
                    if (/\.(dmg|zip|exe)$/.test(filename)) {
                        client.putObjectFromFile(bucket, object, path.join(dir, filename)).then(
                            () => console.log(`上传完毕 => ${object}`),
                            res => console.error(res)
                        );
                    } else if (/\.(yml|json)$/.test(filename)) {
                        client.putObjectFromString(bucket, object, buffer)
                            .then(
                                () => console.log(`上传完毕 => ${object}`),
                                ex => console.error(ex)
                            );
                    }
                } else {
                    console.error(err.message);
                }
            }
        );
}

function publish(distDir) {
    walk.files(distDir, (basedir, filename) => {
        const ext = path.extname(filename);
        // osx dmg
        if (ext === '.dmg') {
            upload(basedir, filename, `${prefix}/${name}-${version}.dmg`);
        }
        // osx zip
        if (ext === '.zip') {
            upload(basedir, filename, `${prefix}/${name}-${version}-mac.zip`);
        }
        // nsis exe
        if (ext === '.exe') {
            upload(basedir, filename, `${prefix}/${name}-${version}-nsis.exe`);
        }

        // osx update json
        if (filename === 'latest-mac.json') {
            try {
                const config = JSON.parse(fs.readFileSync(`${basedir}/${filename}`, 'utf8'));
                config.url = `http://bce-bos-client.bj.bcebos.com/${prefix}/${name}-${version}-mac.zip`;

                upload(basedir, filename, `${prefix}/${filename}`, JSON.stringify(config));
            } catch (ex) {
                console.error(ex.message);
            }
        }

        // osx update yaml
        if (filename === 'latest-mac.yml') {
            try {
                const config = yaml.safeLoad(fs.readFileSync(`${basedir}/${filename}`, 'utf8'));
                config.path = `${name}-${version}-mac.zip`;

                upload(basedir, filename, `${prefix}/${filename}`, yaml.dump(config));
            } catch (ex) {
                console.error(ex.message);
            }
        }

        // nsis update yaml
        if (filename === 'latest.yml') {
            try {
                const config = yaml.safeLoad(fs.readFileSync(`${basedir}/${filename}`, 'utf8'));
                config.path = `${name}-${version}-nsis.exe`;

                upload(basedir, filename, `${prefix}/${filename}`, yaml.dump(config));
            } catch (ex) {
                console.error(ex.message);
            }
        }
    },
    err => console.log(err.message));
}

if (BOS_AK && BOS_SK && BOS_ENDPOINT) {
    const outDir = buildPackage.build.directories.output;
    const distDir = path.join(__dirname, '..', outDir);

    publish(distDir);
    publish(`${distDir}/github`);
} else {
    console.log('终止发布操作，请配置环境变量BOS_AK、BOS_SK、BOS_ENDPOINT。');
}
