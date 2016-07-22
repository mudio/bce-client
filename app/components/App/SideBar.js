/**
 * Component - SideBar Component
 *
 * @file SideBar.js
 * @author mudio(job.mudio@gmail.com)
 */

import styles from './SideBar.css';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';
import {TRANS_FINISH} from '../../utils/TransferStatus';
import {regions, getLocalText} from '../../utils/region';
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
                <div className={styles.header}>百度开放云</div>
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
                    <Link to="/log" className={styles.item} activeClassName={styles.active}>
                        <i className="fa fa-book" />
                        操作日志
                    </Link>
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
