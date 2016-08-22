/**
 * Component - DownloadItem Component
 *
 * @file DownloadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import styles from './DownloadItem.css';
import {getText, TRANS_ERROR} from '../../utils/TransferStatus';

export default class DownloadItem extends Component {
    static propTypes = {
        item: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired,
            size: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
            loaded: PropTypes.number.isRequired,
            path: PropTypes.string.isRequired,
            error: PropTypes.string,
            process: PropTypes.shape({
                rate: PropTypes.number,
                schedule: PropTypes.number
            })
        })
    };

    getLoader() {
        const {loaded, size, status} = this.props.item;
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
            const width = Math.min(100, 100 * loaded / size); // eslint-disable-line no-mixed-operators
            return (
                <span className={`${styles.loader} ${klass}`} style={{width: `${width}%`}} />
            );
        }
        return '';
    }

    getSize() {
        const size = this.props.item.size;

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
        const {region, bucket, key, path} = this.props.item;

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <i className={`fa fa-file-text fa-3x fa-fw ${styles.icon}`} />
                    <div className={styles.summary}>
                        <div>{region}://{bucket}/{key}</div>
                        <div>
                            {path}
                            <span className={styles.seperation}>|</span>
                            {this.getSize()}
                        </div>
                    </div>
                    {this.getStatus()}
                </div>
                {this.getLoader()}
            </div>
        );
    }
}
