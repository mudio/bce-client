/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import styles from './UploadItem.css';
import {getText, TRANS_ERROR} from '../../utils/TransferStatus';

export default class UploadItem extends Component {
    static propTypes = {
        item: PropTypes.shape({
            filePath: PropTypes.string.isRequired,
            fileSize: PropTypes.number.isRequired,
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            loaded: PropTypes.number.isRequired,
            error: PropTypes.string
        })
    };

    getLoader() {
        const {loaded, fileSize, status} = this.props.item;
        let klass = '';

        switch (status) {
        case TRANS_ERROR: {
            klass = styles.error;
            break;
        }
        default:
            klass = '';
        }

        if (loaded) {
            const width = Math.min(100, 100 * loaded / fileSize); // eslint-disable-line no-mixed-operators
            return (
                <span className={`${styles.loader} ${klass}`} style={{width: `${width}%`}} />
            );
        }
        return '';
    }

    getSize() {
        const size = this.props.item.fileSize || 0;

        if (size > 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
        } else if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)}MB`;
        }

        return `${(size / 1024).toFixed(2)}KB`;
    }

    getStatus() {
        const {status, error} = this.props.item;

        if (error) {
            return (<div className={styles.status}>{error}</div>);
        }

        return (<div className={styles.status}>{getText(status)}</div>);
    }

    render() {
        const {item} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <i className={`fa fa-file-text fa-3x fa-fw ${styles.icon}`} />
                    <div className={styles.summary}>
                        <div>{item.region}://{item.bucket}/{item.key}</div>
                        <div>{this.getSize()}</div>
                    </div>
                    {this.getStatus()}
                </div>
                {this.getLoader()}
            </div>
        );
    }
}
