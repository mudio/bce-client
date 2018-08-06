/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Modal, Tooltip} from 'antd';
import React, {Component} from 'react';

import styles from './DownloadItem.css';
import {humanSize, humenRate} from '../../../utils';
import {getText, UploadStatus} from '../../utils/TransferStatus';
import {uploadRemove, uploadStart, uploadSuspend} from '../../actions/uploader';

export default class UploadItem extends Component {
    static propTypes = {
        error: PropTypes.string,
        rate: PropTypes.number,
        offsetSize: PropTypes.number,
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        bucketName: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        totalSize: PropTypes.number.isRequired,
        keymap: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    getLoader() {
        const {totalSize = 1, offsetSize = 0, status} = this.props;

        const klass = classnames(
            styles.loader,
            {[styles.error]: status === UploadStatus.Error}
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
        const {status, rate, offsetSize = 0, totalSize, error} = this.props;
        const progress = ~~(100 * offsetSize / totalSize); // eslint-disable-line

        switch (status) {
        case UploadStatus.Running: {
            return (
                <div className={styles.statusWrap}>
                    <div>{humenRate(rate)}</div>
                    <div className={styles.status}>{progress}%</div>
                </div>
            );
        }
        case UploadStatus.Error: {
            return (
                <div className={styles.statusWrap}>
                    <div className={classnames(styles.status, styles.error)}>
                        <Tooltip title={error}>
                            <i className="fa fa-exclamation-triangle" />
                            {getText(status)}
                        </Tooltip>
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
        const {uuid, name, dispatch} = this.props;

        Modal.confirm({
            title: '删除提示',
            content: `您确定删除 ${name} 吗?`,
            onOk() {
                dispatch(uploadRemove([uuid]));
            }
        });
    }

    _onStart = () => {
        const {uuid, status, dispatch} = this.props;

        if (status === UploadStatus.Paused
            || status === UploadStatus.Error) {
            dispatch(uploadStart([uuid]));
        }
    }

    _onSuspend = () => {
        const {uuid, status, dispatch} = this.props;

        if (status === UploadStatus.Running
            || status === UploadStatus.Waiting) {
            dispatch(uploadSuspend([uuid]));
        }
    }

    renderOperation() {
        const {status} = this.props;

        const start = () => {
            const className = classnames(
                'fa', 'fa-play', 'fa-fw',
                {[styles.hidden]: status !== UploadStatus.Error && status !== UploadStatus.Paused}
            );

            return (
                <i className={className} title="开始任务" onClick={this._onStart} />
            );
        };

        const pause = () => {
            const className = classnames(
                'fa', 'fa-pause', 'fa-fw',
                {[styles.hidden]: status !== UploadStatus.Running && status !== UploadStatus.Waiting}
            );

            return (
                <i className={className} title="暂停任务" onClick={this._onSuspend} />
            );
        };

        const trash = () => {
            const hidden = status !== UploadStatus.Error
                        && status !== UploadStatus.Finish
                        && status !== UploadStatus.Paused;

            const className = classnames(
                'fa', 'fa-trash', 'fa-fw', styles.trash,
                {[styles.hidden]: hidden}
            );

            return (
                <i className={className} title="删除任务" onClick={this._onTrash} />
            );
        };

        return (
            <div className={styles.operation}>
                {start()}
                {pause()}
                {trash()}
            </div>
        );
    }

    render() {
        const {bucketName, prefix, name, keymap, totalSize, offsetSize = 0} = this.props;

        const extname = path.extname(name);
        const keys = Object.keys(keymap);
        const style = classnames(styles.fileicon, {
            'asset-folder': keys.length > 1,
            'asset-normal': keys.length <= 1,
            [`asset-${extname}`]: keys.length <= 1
        });

        return (
            <div className={styles.container}>
                <i className={style} />
                <div className={styles.summary}>
                    <Tooltip title={`${bucketName}/${path.posix.join(prefix, name)}`}>
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
