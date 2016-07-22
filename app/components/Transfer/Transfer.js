/**
 * Component - Transfer Component
 *
 * @file Transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import styles from './Transfer.css';
import Header from './Header';
import React, {Component, PropTypes} from 'react';
import UploadItem from './UploadItem';
import {TransUploadType, TransDownloadType} from '../../utils/BosType';

export default class Transfer extends Component {
    static propTypes = {
        params: PropTypes.shape({
            transType: PropTypes.string.isRequired
        }),
        uploads: PropTypes.array.isRequired,
        downloads: PropTypes.array.isRequired
    };

    render() {
        const {uploads, downloads} = this.props;
        const {transType} = this.props.params;

        if (transType === TransUploadType) {
            return (
                <div className={styles.container}>
                    <Header />
                    <div className={styles.content}>
                    {
                        uploads.map(
                            item => (<UploadItem key={item.uploadId} item={item} />)
                        )
                    }
                    {
                        uploads.length === 0
                        && <span className={`fa fa-cloud-upload ${styles.nocontent}`}>没有上传任务~(&gt;_&lt;)!!!</span>
                    }
                    </div>
                </div>
            );
        } else if (transType === TransDownloadType) {
            return (
                <div className={styles.container}>
                    <Header />
                    {
                        downloads.map(item => (
                            <span key={item.key}>{item.bucket}/{item.key}</span>
                        ))
                    }
                    {
                        downloads.length === 0
                        && <span className={`fa fa-cloud-download ${styles.nocontent}`}>没有下载任务~(&gt;_&lt;)!!!</span>
                    }
                </div>
            );
        }
    }
}
