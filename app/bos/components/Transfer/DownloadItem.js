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

import styles from './DownloadItem.css';
import {getText, DownloadStatus} from '../../utils/TransferStatus';
import {downloadStart, downloadRemove, downloadSuspend} from '../../actions/downloader';

const {shell} = electron;

export default class DownloadItem extends Component {
    static propTypes = {
        error: PropTypes.string,
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        basedir: PropTypes.string.isRequired,
        totalSize: PropTypes.number.isRequired,
        offsetSize: PropTypes.number.isRequired,
        keymap: PropTypes.shape({
            error: PropTypes.number.isRequired,
            waiting: PropTypes.number.isRequired,
            complete: PropTypes.number.isRequired,
        }),
        dispatch: PropTypes.func.isRequired
    };

    getLoader() {
        const {totalSize, offsetSize = 0, status} = this.props;

        const klass = classnames(
            styles.loader,
            {[styles.error]: status === DownloadStatus.Error}
        );

        const width = 100 * offsetSize / totalSize; // eslint-disable-line no-mixed-operators

        return (
            <div className={styles.progress}>
                <div className={styles.loader}>
                    <div className={classnames(styles.step, klass)} style={{width: `${width}%`}} />
                </div>
                {this.getStatus()}
            </div>
        );
    }

    getSize() {
        const {totalSize = 0, offsetSize = 0} = this.props;
        const unitKB = 1024;
        const unitMB = 1024 * 1024;
        const unitGB = 1024 * 1024 * 1024;

        function humanSize(size = 0) {
            if (size >= unitGB) {
                return `${(size / unitGB).toFixed(0)}GB`;
            } else if (size >= unitMB && size < unitGB) {
                return `${(size / unitMB).toFixed(0)}MB`;
            }
            return `${(size / unitKB).toFixed(0)}KB`;
        }

        return `${humanSize(offsetSize)}  /  ${humanSize(totalSize)}`;
    }

    getStatus() {
        const {
            keymap,
            status,
            totalSize,
            offsetSize = 0,
        } = this.props;
        const progress = ~~(100 * offsetSize / totalSize); // eslint-disable-line

        switch (status) {
        case DownloadStatus.Init:
            return (
                <div className={styles.status}>
                    <i className="fa fa-spinner fa-pulse" />
                    {getText(status)}
                </div>
            );
        case DownloadStatus.Running: {
            return (
                <div className={styles.status}>{progress}%</div>
            );
        }
        case DownloadStatus.Error: {
            const errTip = `已完成任务：${keymap.complete}个\n未完成任务：${keymap.waiting}个\n运行错误数：${keymap.error}个`;
            return (
                <div className={classnames(styles.status, styles.error)}>
                    <i className="fa fa-exclamation-triangle" title={errTip} />
                    {progress}%
                </div>
            );
        }
        default:
            return (<div className={styles.status}>{getText(status)}</div>);
        }
    }


    _onTrash() {
        const {uuid, name, dispatch} = this.props;

        const remote = electron.remote;

        const comfirmTrash = !remote.dialog.showMessageBox(
            remote.getCurrentWindow(),
            {
                message: `您确定删除 ${name} 吗?`,
                title: '删除提示',
                buttons: ['删除', '取消'],
                cancelId: 1
            }
        );

        if (comfirmTrash) {
            dispatch(downloadRemove([uuid]));
        }
    }

    _onSuspend() {
        const {uuid, status, dispatch} = this.props;

        if (status === DownloadStatus.Running
            || status === DownloadStatus.Waiting) {
            dispatch(downloadSuspend([uuid]));
        }
    }

    _onStart() {
        const {uuid, status, dispatch} = this.props;

        if (status === DownloadStatus.Suspended
            || status === DownloadStatus.Error) {
            dispatch(downloadStart([uuid]));
        }
    }

    renderOperation() {
        const {name, basedir, status} = this.props;
        const localDir = path.join(basedir, name);

        const start = () => {
            const className = classnames(
                'fa', 'fa-play', 'fa-fw',
                {[styles.hidden]: status !== DownloadStatus.Error && status !== DownloadStatus.Suspended}
            );

            return (
                <i className={className} title="开始任务" onClick={() => this._onStart()} />
            );
        };

        const pause = () => {
            const className = classnames(
                'fa', 'fa-pause', 'fa-fw',
                {[styles.hidden]: status !== DownloadStatus.Running && status !== DownloadStatus.Waiting}
            );

            return (
                <i className={className} title="暂停任务" onClick={() => this._onSuspend()} />
            );
        };

        const trash = () => {
            const hidden = status !== DownloadStatus.Error
                && status !== DownloadStatus.Finish
                && status !== DownloadStatus.Suspended
                && status !== DownloadStatus.Suspending;

            const className = classnames(
                'fa', 'fa-trash', 'fa-fw', styles.trash,
                {[styles.hidden]: hidden}
            );

            return (
                <i className={className} title="删除任务" onClick={() => this._onTrash()} />
            );
        };

        return (
            <div className={styles.operation} >
                {start()}
                {pause()}
                <i className="fa fa-folder-open" title="打开目录" onClick={() => shell.showItemInFolder(localDir)} />
                {trash()}
            </div>
        );
    }

    render() {
        const {region, bucket, prefix, name} = this.props;
        let style = '';

        if (name.endsWith('/')) {
            style = classnames(styles.fileicon, 'asset-folder');
        } else {
            const ext = name.split('.').pop().toLowerCase();
            style = classnames(styles.fileicon, 'asset-normal', `asset-${ext}`);
        }

        return (
            <div className={styles.container}>
                <i className={style} />
                <div className={styles.summary}>
                    <div>
                        {region}://{bucket}/{prefix}{name}
                    </div>
                    <div>
                        {this.getSize()}
                    </div>
                </div>
                {this.getLoader()}
                {this.renderOperation()}
            </div>
        );
    }
}
