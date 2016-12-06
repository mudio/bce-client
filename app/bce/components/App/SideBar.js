/**
 * Component - SideBar Component
 *
 * @file SideBar.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable max-len */

import {Link} from 'react-router';
import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';

import Version from './Version';
import styles from './SideBar.css';
import BrowserLink from '../Common/BrowserLink';
import {UploadStatus, DownloadStatus} from '../../utils/TransferStatus';

class SideBar extends Component {
    static propTypes = {
        uploadCount: PropTypes.number.isRequired,
        downloadCount: PropTypes.number.isRequired,
        completeCount: PropTypes.number.isRequired
    };

    render() {
        const {uploadCount, downloadCount, completeCount} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -5 40 45.6" width="180px" height="140px">
                        <g fill="#2eacfc">
                            <path d="M14.1,23.2v-4.2c0-0.8-0.5-1.6-1.1-2L10,15.3v10.3c0,0.2,0.2,0.5,0.4,0.6l9,5.1v-3.4c0-0.8-0.5-1.6-1.1-2l-3.7-2.2C14.2,23.7,14.1,23.4,14.1,23.2z" />
                            <path d="M25.5,23.8l-3.7,2.2c-0.7,0.4-1.1,1.2-1.1,2v3.4l8.9-5.2c0.2-0.2,0.4-0.4,0.4-0.6V15.2l-2.9,1.7c-0.7,0.4-1.1,1.2-1.1,2v4.2C25.9,23.4,25.8,23.7,25.5,23.8z" />
                            <path d="M24.3,11l-3.8-2.2c-0.2-0.2-0.5-0.2-0.8,0L10.8,14l2.9,1.7c0.7,0.4,1.6,0.4,2.3,0l3.8-2.2c0.1,0,0.1-0.1,0.2-0.1c0.2-0.1,0.4,0,0.5,0.1l3.8,2.2c0.7,0.4,1.6,0.4,2.3,0l2.9-1.7L24.3,11z" />
                        </g>
                    </svg>
                </div>
                <div className={styles.body}>
                    <Link to={'/region'}
                        className={`${styles.item} ${styles.region}`}
                        activeClassName={styles.active}
                    >
                        全部文件
                    </Link>
                    <Link to={'/download'}
                        className={`${styles.item} ${styles.download}`}
                        activeClassName={styles.active}
                    >
                        正在下载
                        {
                            downloadCount > 0 ? <span className={styles.badge}>{downloadCount}</span> : ''
                        }
                    </Link>
                    <Link to={'/upload'}
                        className={`${styles.item} ${styles.upload}`}
                        activeClassName={styles.active}
                    >
                        正在上传
                        {
                            uploadCount > 0 ? <span className={styles.badge}>{uploadCount}</span> : ''
                        }
                    </Link>
                    <Link to={'/complete'}
                        className={`${styles.item} ${styles.complete}`}
                        activeClassName={styles.active}
                    >
                        <i className=" fa fa-check-square-o" />
                        传输完成
                        {
                            completeCount > 0 ? <span className={styles.badge}>{completeCount}</span> : ''
                        }
                    </Link>
                </div>
                <div className={styles.tool}>
                    <BrowserLink linkTo="https://cloud.baidu.com/doc/BOS/API.html">
                        开发者文档
                    </BrowserLink>
                    <BrowserLink linkTo="https://github.com/leeight/bce-bos-uploader/">
                        Web Uploader
                    </BrowserLink>
                    <BrowserLink linkTo="https://github.com/baidubce/bce-sdk-js">
                        JavaScript SDK
                    </BrowserLink>
                    <BrowserLink linkTo="https://github.com/mudio/bos/issues">
                        客户端问题反馈
                    </BrowserLink>
                    <Version />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {uploads, downloads, routing} = state;

    const uploadCount = uploads.filter(item => item.status !== UploadStatus.Finish).length;
    const downloadCount = downloads.filter(item => item.status !== DownloadStatus.Finish).length;

    return {
        routing,
        uploadCount,
        downloadCount,
        completeCount: uploads.length - uploadCount + downloads.length - downloadCount // eslint-disable-line
    };
}

export default connect(mapStateToProps)(SideBar);
