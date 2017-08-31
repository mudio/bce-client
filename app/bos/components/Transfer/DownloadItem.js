/**
 * Component - DownloadItem Component
 *
 * @file DownloadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import electron from 'electron';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, {Component} from 'react';
import {Modal, Tooltip} from 'antd';

import styles from './DownloadItem.css';
import {humanSize, humenRate} from '../../utils/utils';
import {getText, DownloadStatus} from '../../utils/TransferStatus';
import {downloadStart, downloadRemove, downloadSuspend} from '../../actions/downloader';

const {shell} = electron;

export default class DownloadItem extends Component {
    static propTypes = {
        rate: PropTypes.number,
        error: PropTypes.string,
        keymap: PropTypes.object,
        offsetSize: PropTypes.number,
        totalSize: PropTypes.number,
        uuid: PropTypes.string.isRequired,
        region: PropTypes.string.isRequired,
        bucketName: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        baseDir: PropTypes.string.isRequired,
        objectKey: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    getLoader() {
        const {totalSize = 1, offsetSize = 0, status} = this.props;

        const klass = classnames(
            styles.loader,
            {[styles.error]: status === DownloadStatus.Error}
        );

        const width = Math.min(100, 100 * offsetSize / totalSize); // eslint-disable-line no-mixed-operators

        return (
            <div className={styles.progress}>
                <div className={styles.loader}>
                    <div className={classnames(styles.step, klass)} style={{width: `${width}%`}} />
                </div>
                {this.getStatus()}
            </div>
        );
    }

    getStatus() {
        const {status, rate, offsetSize = 0, totalSize} = this.props;
        const progress = ~~(100 * offsetSize / totalSize); // eslint-disable-line

        switch (status) {
        case DownloadStatus.Init:
            return (
                <div className={styles.statusWrap}>
                    <div className={styles.status}>
                        <i className="fa fa-spinner fa-pulse" />
                        {getText(status)}
                    </div>
                </div>
            );
        case DownloadStatus.Running: {
            return (
                <div className={styles.statusWrap}>
                    <div>{humenRate(rate)}</div>
                    <div className={styles.status}>{progress}%</div>
                </div>
            );
        }
        case DownloadStatus.Error: {
            return (
                <div className={styles.statusWrap}>
                    <div className={classnames(styles.status, styles.error)}>
                        <i className="fa fa-exclamation-triangle" />
                        {progress}%
                    </div>
                </div>
            );
        }
        default:
            return (
                <div className={styles.statusWrap}>
                    <div className={styles.status}>{getText(status)}</div>
                </div>
            );
        }
    }

    _onTrash = () => {
        const {uuid, dispatch, prefix, objectKey} = this.props;
        const name = path.posix.relative(prefix, objectKey).split('/')[0];

        Modal.confirm({
            title: '删除提示',
            content: `您确定删除 ${name} 吗?`,
            onOk() {
                dispatch(downloadRemove([uuid]));
            }
        });
    }

    _onSuspend = () => {
        const {uuid, status, dispatch} = this.props;

        if (status === DownloadStatus.Running
            || status === DownloadStatus.Waiting) {
            dispatch(downloadSuspend([uuid]));
        }
    }

    _onStart = () => {
        const {uuid, status, dispatch} = this.props;

        if (status === DownloadStatus.Paused
            || status === DownloadStatus.Error) {
            dispatch(downloadStart([uuid]));
        }
    }

    _showItemInFolder = () => {
        const {baseDir, prefix, objectKey} = this.props;
        const name = path.posix.relative(prefix, objectKey).split('/')[0];

        shell.showItemInFolder(path.join(baseDir, name));
    }

    renderOperation() {
        const {status} = this.props;

        const start = () => {
            const className = classnames(
                'fa', 'fa-play', 'fa-fw',
                {[styles.hidden]: status !== DownloadStatus.Error && status !== DownloadStatus.Paused}
            );

            return (
                <i className={className} title="开始任务" onClick={this._onStart} />
            );
        };

        const pause = () => {
            const className = classnames(
                'fa', 'fa-pause', 'fa-fw',
                {[styles.hidden]: status !== DownloadStatus.Running && status !== DownloadStatus.Waiting}
            );

            return (
                <i className={className} title="暂停任务" onClick={this._onSuspend} />
            );
        };

        const trash = () => {
            const hidden = status !== DownloadStatus.Error
                && status !== DownloadStatus.Finish
                && status !== DownloadStatus.Paused;

            const className = classnames(
                'fa', 'fa-trash', 'fa-fw', styles.trash,
                {[styles.hidden]: hidden}
            );

            return (
                <i className={className} title="删除任务" onClick={this._onTrash} />
            );
        };

        return (
            <div className={styles.operation} >
                {start()}
                {pause()}
                <i className="fa fa-folder-open" title="打开目录" onClick={this._showItemInFolder} />
                {trash()}
            </div>
        );
    }

    render() {
        const {region, bucketName, prefix, objectKey, status} = this.props;
        // remove `.`
        const extname = path.extname(objectKey).slice(1);
        const name = path.posix.relative(prefix, objectKey).split('/')[0];
        const isFolder = objectKey.endsWith('/');

        const style = classnames(styles.fileicon, {
            'asset-folder': isFolder,
            'asset-normal': !isFolder,
            [`asset-${extname}`]: !isFolder,
        });

        if (status === DownloadStatus.Init) {
            return (
                <div className={styles.container}>
                    <i className={style} />
                    <div className={styles.summary}>
                        <Tooltip title={`${region}://${bucketName}/${prefix}${name}`}>
                            {name}
                        </Tooltip>
                    </div>
                    {this.getLoader()}
                </div>
            );
        }

        const {totalSize = 0, offsetSize = 0} = this.props;
        return (
            <div className={styles.container}>
                <i className={style} />
                <div className={styles.summary}>
                    <Tooltip title={`${region}://${bucketName}/${prefix}${name}`}>
                        {name}
                    </Tooltip>
                    <div>{humanSize(offsetSize)} / {humanSize(totalSize)}</div>
                </div>
                {this.getLoader()}
                {this.renderOperation()}
            </div>
        );
    }
}
