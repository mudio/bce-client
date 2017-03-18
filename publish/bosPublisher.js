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
const prefix = 'releases';

const client = new BosClient({
    credentials: {
        ak: BOS_AK,
        sk: BOS_SK
    },
    endpoint: BOS_ENDPOINT
});

function upload(dir, filename, object) {
    client.getObjectMetadata(bucket, object)
        .then(
            () => console.log(`取消，已经存在 => ${object}`),
            err => {
                if (err.status_code === 404) {
                    if (/\.(dmg|zip|exe)$/.test(filename)) {
                        client.putObjectFromFile(bucket, object, path.join(dir, filename)).then(
                            () => console.log(`上传完毕 => ${object}`),
                            res => console.log(res)
                        );
                    } else if (/\.(yml|json)$/.test(filename)) {
                        client.putObjectFromString(bucket, `${prefix}/${filename}`, object).then(
                            () => console.log(`上传完毕 ==> ${prefix}/${filename}`),
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
            upload(basedir, filename, `${prefix}/v${appPackage.version}/${name}-${version}.dmg`);
        }
        // osx zip
        if (ext === '.zip') {
            upload(basedir, filename, `${prefix}/v${appPackage.version}/${name}-${version}.zip`);
        }
        // osx update conf
        if (filename === 'latest-mac.json') {
            try {
                const config = JSON.parse(fs.readFileSync(`${basedir}/${filename}`, 'utf8'));
                config.url = `http://bce-bos-client.cdn.bcebos.com/${prefix}/v${appPackage.version}/${name}-${version}.zip`;

                upload(basedir, filename, JSON.stringify(config));
            } catch (ex) {
                console.error(ex.message);
            }
        }

        // nsis exe
        if (ext === '.exe') {
            upload(basedir, filename, `${prefix}/v${appPackage.version}/${name}-${version}-nsis.exe`);
        }
        // nsis update yaml
        if (ext === '.yml') {
            try {
                const config = yaml.safeLoad(fs.readFileSync(`${basedir}/${filename}`, 'utf8'));
                config.path = `http://bce-bos-client.cdn.bcebos.com/${prefix}/v${appPackage.version}/${name}-${version}-nsis.exe`;

                upload(basedir, filename, JSON.stringify(config));
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
    publish(`${distDir}/mac`);
    publish(`${distDir}/mac/github`);
} else {
    console.log('终止发布操作，请配置环境变量BOS_AK、BOS_SK、BOS_ENDPOINT。');
}
