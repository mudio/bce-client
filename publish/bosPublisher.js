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
const {version, name} = appPackage;
const outDir = buildPackage.directories.output;
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
        // osx 平台发布dmg、zip包用于程序发布及更新
        walk.files(
            path.join(distDir, 'mac'), // mac 由electron-builder生成，版本更新需要手动修改
            (basedir, filename) => {
                const ext = path.extname(filename);

                if (ext === '.dmg') {
                    const target = `${prefix}/v${version}/${name}-${version}.dmg`;
                    upload(basedir, filename, target);
                } else if (ext === '.zip') {
                    const target = `${prefix}/v${version}/${name}-${version}-mac.zip`;
                    upload(basedir, filename, target);
                }
            },
            err => console.log(err)
        );
    }

    if (os.platform() === 'win32') {
        // win32 平台发布nsis installer、squirrel installer、squirrel nupkg包用于程序发布及更新
        // squirrel
        walk.files(
            path.join(distDir, 'win'), // win 由electron-builder生成，版本更新需要手动修改
            (basedir, filename) => {
                if (filename === 'RELEASES' || path.extname(filename) === '.nupkg') {
                    const target = `${prefix}/v${version}/${filename}`;
                    upload(basedir, filename, target);
                } else if (path.extname(filename) === '.exe') {
                    const target = `${prefix}/v${version}/${name}-${version}-setup.exe`;
                    upload(basedir, filename, target);
                }
            },
            err => console.log(err)
        );

        // nsis
        walk.files(
            distDir, // nsis 安装包在根目录下
            (basedir, filename) => {
                if (path.extname(filename) === '.exe') {
                    const target = `${prefix}/v${version}/${name}-${version}-nsis.exe`;
                    upload(basedir, filename, target);
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
