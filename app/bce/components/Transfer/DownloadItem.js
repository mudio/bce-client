/**
 * Component - DownloadItem Component
 *
 * @file DownloadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import electron from 'electron';
import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './DownloadItem.css';
import {getText, DownloadStatus} from '../../utils/TransferStatus';
import {downloadRemove} from '../../actions/downloader';

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
        errorQueue: PropTypes.array.isRequired,
        waitingQueue: PropTypes.array.isRequired,
        completeQueue: PropTypes.array.isRequired,
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
            <div>
                <span className={styles.progress}>
                    <span className={classnames(styles.loader, klass)} style={{width: `${width}%`}} />
                </span>
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
            status,
            totalSize,
            offsetSize = 0,
            errorQueue,
            waitingQueue,
            completeQueue
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
            const errTip = `已完成任务：${completeQueue.length}个\n未完成任务：${waitingQueue.length}个\n运行错误数：${errorQueue.length}个`;
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

    renderOperation() {
        const {name, basedir, status} = this.props;
        const localDir = path.join(basedir, name);

        const customOperation = () => {
            switch (status) {
            case DownloadStatus.Error:
                return (<i className="fa fa-wrench fa-fw" title="修复任务" onClick={() => this._onRepair()} />);
            case DownloadStatus.Suspend:
                return (<i className="fa fa-play fa-fw" title="开始任务" onClick={() => this._onStart()} />);
            case DownloadStatus.Running:
            case DownloadStatus.Waiting:
                return (<i className="fa fa-pause fa-fw" title="暂停任务" />);
            case DownloadStatus.Finish:
                return (
                    <i className="fa fa-folder-open" title="打开目录" onClick={() => shell.showItemInFolder(localDir)} />
                );
            default:
                return null;
            }
        };

        return (
            <div className={styles.operation} >
                {customOperation()}
                <i className="fa fa-trash" title="删除任务" onClick={() => this._onTrash()} />
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
