/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import styles from './UploadItem.css';
import {getText, TRANS_ERROR, TRANS_FINISH} from '../../utils/TransferStatus';

export default class UploadItem extends Component {
    static propTypes = {
        filePath: PropTypes.string.isRequired,
        fileSize: PropTypes.number.isRequired,
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string.isRequired,
        object: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        loaded: PropTypes.number.isRequired,
        error: PropTypes.string
    };

    getLoader() {
        let klass = '';
        const {loaded, fileSize, status} = this.props;
        let width = 100 * loaded / fileSize; // eslint-disable-line no-mixed-operators

        switch (status) { // eslint-disable-line default-case
        case TRANS_ERROR: {
            klass = styles.error;
            break;
        }
        case TRANS_FINISH: {
            width = 100;
            break;
        }
        }

        return (
            <span className={`${styles.loader} ${klass}`} style={{width: `${width}%`}} />
        );
    }

    getSize() {
        const size = this.props.fileSize || 0;

        if (size > 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
        } else if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)}MB`;
        }

        return `${(size / 1024).toFixed(2)}KB`;
    }

    getStatus() {
        const {status, error} = this.props;

        if (error) {
            return (<div className={styles.status}>{error}</div>);
        }

        return (<div className={styles.status}>{getText(status)}</div>);
    }

    render() {
        const {region, bucket, object} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <i className={`fa fa-file-text fa-3x fa-fw ${styles.icon}`} />
                    <div className={styles.summary}>
                        <div>{region}://{bucket}/{object}</div>
                        <div>{this.getSize()}</div>
                    </div>
                    {this.getStatus()}
                </div>
                {this.getLoader()}
            </div>
        );
    }
}
