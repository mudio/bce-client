/**
 * client publisher: 发布程序到BOS上
 *
 * @file bosPubliser.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable no-console */

import os from 'os';
import path from 'path';
import walk from 'fs-walk';
import {BosClient} from 'bce-sdk-js';

import buildPackage from '../package.json';
import appPackage from '../static/package.json';

const {BOS_AK, BOS_SK, BOS_ENDPOINT} = process.env;
const outDir = buildPackage.build.directories.output;
const distDir = path.join(__dirname, '..', outDir);

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
                    client.putObjectFromFile(bucket, object, path.join(dir, filename))
                        .then(
                            () => console.log(`上传完毕 => ${object}`),
                            res => console.log(res)
                        );
                } else {
                    console.error(err.message);
                }
            }
        );
}

function publish() {
    if (os.platform() === 'darwin') {
        // osx 平台发布dmg程序安装包
        walk.files(
            path.join(distDir, 'mac'), // mac 由electron-builder生成，版本更新需要手动修改
            (basedir, filename) => {
                const ext = path.extname(filename);

                if (ext === '.dmg') {
                    upload(basedir, filename, `${prefix}/v${appPackage.version}/${filename}`);
                }
            },
            err => console.log(err)
        );
        // latest-mac.json
        upload(
            path.join(distDir, 'github'), 'latest-mac.json', `${prefix}/latest-mac.json`
        );
    }

    if (os.platform() === 'win32') {
        // nsis latest.yml
        walk.files(
            distDir,
            (basedir, filename) => {
                const ext = path.extname(filename);
                if (ext === '.exe' || ext === '.yml') {
                    upload(basedir, filename, `${prefix}/v${appPackage.version}/${filename}`);
                }
            },
            err => console.log(err)
        );
    }
}

if (BOS_AK && BOS_SK && BOS_ENDPOINT) {
    publish();
} else {
    console.log('终止发布操作，请配置环境变量BOS_AK、BOS_SK、BOS_ENDPOINT。');
}
