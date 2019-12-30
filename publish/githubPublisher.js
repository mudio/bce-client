/**
 * client publisher: 发布程序到github上
 *
 * @file githubPublisher.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable no-console */

import fs from 'fs';
import url from 'url';
import path from 'path';
import mime from 'mime';
import {walk, Settings} from '@nodelib/fs.walk';
import request from 'request';

import buildPackage from '../package.json';
import appPackage from '../static/package.json';

const {GH_TOKEN} = process.env;
const {version, name} = appPackage;
const outDir = buildPackage.build.directories.output;
const distDir = path.join(__dirname, '..', outDir);

const client = request.defaults({
    headers: {
        'User-Agent': 'bce-client-publisher',
        Accept: 'application/vnd.github.v3+json',
        authorization: `token ${GH_TOKEN}`
    }
});

function upload(dir, fileName, uploadUrl) {
    request(
        {
            url: uploadUrl,
            method: 'POST',
            body: fs.readFileSync(path.join(dir, fileName)),
            headers: {
                'User-Agent': 'bce-client-publisher',
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': mime.getType(fileName),
                authorization: `token ${GH_TOKEN}`
            }
        },
        (error, response, body) => {
            if (error) {
                console.error(error.message);
                return;
            }

            if (response.statusCode === 201) {
                const parseUrl = url.parse(uploadUrl);
                console.log(`上传完毕 => ${parseUrl.query.slice(5)}`);
                return;
            }

            if (response.statusCode === 422) {
                const res = JSON.parse(body);
                console.error(res.errors);
                return;
            }

            return console.warn(response.statusCode, body);
        }
    );
}

function prepareUpload(basedir, filename, uploadUrl, assetName, draft) {
    const existAsset = draft.assets.find(item => item.name === assetName);

    if (existAsset) {
        client.del(existAsset.url).on(
            'response',
            () => {
                console.log(`覆盖文件 => ${existAsset.name}!`);
                upload(basedir, filename, `${uploadUrl}?name=${assetName}`);
            }
        );
    } else {
        upload(basedir, filename, `${uploadUrl}?name=${assetName}`);
    }
}

function publish() {
    client.get('https://api.github.com/repos/mudio/bce-client/releases', (error, response, body) => {
        if (error) {
            console.error(error.message);
            return;
        }

        if (response.statusCode !== 200) {
            console.log(`${response.statusCode} => ${body}`);
            return;
        }

        try {
            const releases = JSON.parse(body);
            const draft = releases.find(item => item.draft);

            if (!draft) {
                console.log('没有找到Draft,取消发布~');
                return;
            }

            const uploadUrl = draft.upload_url.substring(0, draft.upload_url.indexOf('{'));

            walk(distDir, new Settings({stats: true}), (err, entries) => {
                if (err) {
                    console.log(err.message);
                    return;
                }

                entries.forEach(file => {
                    const filename = path.relative(distDir, file.path);
                    const ext = path.extname(filename);
                    if (ext === '.exe') {
                        const assetName = `${name}-${version}-nsis.exe`;
                        prepareUpload(basedir, filename, uploadUrl, assetName, draft);
                    }

                    if (ext === '.dmg') {
                        const assetName = `${name}-${version}.dmg`;
                        prepareUpload(basedir, filename, uploadUrl, assetName, draft);
                    }
                });
            });
        } catch (ex) {
            console.error(ex.message);
        }
    });
}

if (GH_TOKEN) {
    publish();
} else {
    console.log('终止发布操作，请配置环境变量GH_TOKEN。');
}
