/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './UploadItem.css';
import {TransType} from '../../utils/BosType';
import {getText, UploadStatus} from '../../utils/TransferStatus';
import {uploadRemove, uploadStart, uploadSuspend} from '../../actions/uploader';

const {shell} = electron;

export default class UploadItem extends Component {
    static propTypes = {
        error: PropTypes.string,
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        basedir: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        totalSize: PropTypes.number.isRequired,
        offsetSize: PropTypes.number.isRequired,
        keymap: PropTypes.shape({
            key: PropTypes.string,
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
            {[styles.error]: status === UploadStatus.Error}
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
            keymap,
            status,
            totalSize,
            offsetSize = 0,
        } = this.props;
        const progress = ~~(100 * offsetSize / totalSize); // eslint-disable-line

        switch (status) {
        case UploadStatus.Indexing:
            return (
                <div className={styles.status}>
                    <i className="fa fa-spinner fa-pulse" />
                    {getText(status)}
                </div>
            );
        case UploadStatus.Running: {
            return (
                <div className={styles.status}>{progress}%</div>
            );
        }
        case UploadStatus.Error: {
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
            dispatch(uploadRemove([uuid]));
        }
    }

    _onStart() {
        const {uuid, status, dispatch} = this.props;

        if (status === UploadStatus.Suspended
            || status === UploadStatus.Error) {
            dispatch(uploadStart([uuid]));
        }
    }

    _onSuspend() {
        const {uuid, status, dispatch} = this.props;

        if (status === UploadStatus.Running
            || status === UploadStatus.Waiting) {
            dispatch(uploadSuspend([uuid]));
        }
    }

    renderOperation() {
        const {basedir, status} = this.props;

        const start = () => {
            const className = classnames(
                'fa', 'fa-play', 'fa-fw',
                {[styles.hidden]: status !== UploadStatus.Error && status !== UploadStatus.Suspended}
            );

            return (
                <i className={className} title="开始任务" onClick={() => this._onStart()} />
            );
        };

        const pause = () => {
            const className = classnames(
                'fa', 'fa-pause', 'fa-fw',
                {[styles.hidden]: status !== UploadStatus.Running && status !== UploadStatus.Waiting}
            );

            return (
                <i className={className} title="暂停任务" onClick={() => this._onSuspend()} />
            );
        };

        const trash = () => {
            const hidden = status !== UploadStatus.Error
                && status !== UploadStatus.Finish
                && status !== UploadStatus.Suspended
                && status !== UploadStatus.Suspending;

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
                <i className="fa fa-folder-open" title="打开目录" onClick={() => shell.showItemInFolder(basedir)} />
                {trash()}
            </div>
        );
    }

    render() {
        const {region, bucket, prefix, name, category} = this.props;
        let style = '';

        if (category === TransType.Directory) {
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
