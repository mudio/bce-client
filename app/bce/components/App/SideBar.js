/**
 * Component - SideBar Component
 *
 * @file SideBar.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Link} from 'react-router';
import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';

import styles from './SideBar.css';
import BrowserLink from '../Common/BrowserLink';
import {TRANS_FINISH} from '../../utils/TransferStatus';
import {regions, getLocalText} from '../../utils/Region';
import {TransUploadType, TransDownloadType} from '../../utils/BosType';

class SideBar extends Component {
    static propTypes = {
        uploadCount: PropTypes.number.isRequired,
        donwloadCount: PropTypes.number.isRequired
    };

    render() {
        const {uploadCount, donwloadCount} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.header} />
                <div className={styles.body}>
                    {
                        regions.map(r => (
                            <Link
                              to={`/region/${r}`}
                              className={styles.item}
                              activeClassName={styles.active}
                              key={`/region/${r}`}
                            >
                                <i className="fa fa-map-marker" />
                                {getLocalText(r)}
                            </Link>
                        ))
                    }
                    <Link to={`/transfer/${TransDownloadType}`} className={styles.item} activeClassName={styles.active}>
                        <i className="fa fa-download" />
                        下载队列
                        {
                            donwloadCount > 0 ? <span className={styles.badge}>{donwloadCount}</span> : ''
                        }
                    </Link>
                    <Link to={`/transfer/${TransUploadType}`} className={styles.item} activeClassName={styles.active}>
                        <i className="fa fa-upload" />
                        上传队列
                        {
                            uploadCount > 0 ? <span className={styles.badge}>{uploadCount}</span> : ''
                        }
                    </Link>
                </div>
                <div className={styles.separate} />
                <div className={styles.body}>
                    <BrowserLink
                      className={styles.item}
                      linkTo="https://cloud.baidu.com/doc/BOS/JavaScript-SDK.html#.E6.A6.82.E8.BF.B0"
                    >
                        <i className="fa fa-share" />
                        开发者文档
                    </BrowserLink>
                    <BrowserLink
                      className={styles.item}
                      linkTo="https://github.com/leeight/bce-bos-uploader/"
                    >
                        <i className="fa fa-share" />
                        Web Uploader
                    </BrowserLink>
                    <BrowserLink
                      className={styles.item}
                      linkTo="https://github.com/baidubce/bce-sdk-js"
                    >
                        <i className="fa fa-share" />
                        JavaScript SDK
                    </BrowserLink>
                    <BrowserLink
                      className={styles.item}
                      linkTo="https://github.com/mudio/bos/issues"
                    >
                        <i className="fa fa-share" />
                        问题反馈
                    </BrowserLink>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const uploadCount = state.uploads.filter(item => item.status !== TRANS_FINISH).length;
    const donwloadCount = state.downloads.filter(item => item.status !== TRANS_FINISH).length;

    return {
        uploadCount,
        donwloadCount,
        routing: state.routing
    };
}

export default connect(mapStateToProps)(SideBar);
