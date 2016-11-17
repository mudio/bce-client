/**
 * Component - DownloadItem Component
 *
 * @file DownloadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './DownloadItem.css';
import {getText, TRANS_ERROR, TRANS_FINISH} from '../../utils/TransferStatus';

export default class DownloadItem extends Component {
    static propTypes = {
        uuid: PropTypes.string.isRequired,
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string.isRequired,
        object: PropTypes.string.isRequired,
        size: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        loaded: PropTypes.number.isRequired,
        path: PropTypes.string.isRequired,
        error: PropTypes.string,
    };

    getLoader() {
        const {loaded, size, status} = this.props;
        let klass = '';
        let width = 100 * loaded / size; // eslint-disable-line no-mixed-operators

        switch (status) { // eslint-disable-line default-case
        case TRANS_ERROR: {
            klass = styles.error;
            break;
        }
        case TRANS_FINISH: {
            width = 100;
        }
        }

        return (
            <span className={styles.progress}>
                <span className={classnames(styles.loader, klass)} style={{width: `${width}%`}} />
            </span>
        );
    }

    getSize() {
        const size = this.props.size;
        let defaultText = `${(size / 1024).toFixed(2)}KB`;

        if (size > 1024 * 1024 * 1024) {
            defaultText = `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
        } else if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            defaultText = `${(size / 1024 / 1024).toFixed(2)}MB`;
        }

        return (
            <span className={styles.size}>{defaultText}</span>
        );
    }

    getStatus() {
        const {status, error} = this.props;

        if (error) {
            return (<div className={styles.status}>{error}</div>);
        }

        return (<div className={styles.status}>{getText(status)}</div>);
    }

    render() {
        const {region, bucket, object, path} = this.props;
        const ext = object.split('.').pop().toLowerCase();

        return (
            <div className={styles.container}>
                <i className={`${styles.fileicon} asset-normal asset-${ext}`} />
                <div className={styles.summary}>
                    <div title={path} className={styles.title}>
                        {object.split('/').pop()}
                        <span className={styles.seperation}>|</span>
                        {this.getSize()}
                    </div>
                    <div>
                        {region}://{bucket}/{object}
                    </div>
                </div>
                {this.getLoader()}
                {this.getStatus()}
            </div>
        );
    }
}
