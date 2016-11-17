/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import classnames from 'classnames';
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
            <span className={styles.progress}>
                <span className={classnames(styles.loader, klass)} style={{width: `${width}%`}} />
            </span>
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
        const ext = object.split('.').pop().toLowerCase();

        return (
            <div className={styles.container}>
                <i className={`${styles.fileicon} asset-normal asset-${ext}`} />
                <div className={styles.summary}>
                    <div>
                        {region}://{bucket}/{object}
                    </div>
                    <div>
                        {this.getSize()}
                    </div>
                </div>
                {this.getLoader()}
                {this.getStatus()}
            </div>
        );
    }
}
