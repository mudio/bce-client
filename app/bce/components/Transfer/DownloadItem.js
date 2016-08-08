/**
 * Component - DownloadItem Component
 *
 * @file DownloadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import styles from './DownloadItem.css';
import {getText} from '../../utils/TransferStatus';

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
            process: PropTypes.shape({
                rate: PropTypes.number,
                schedule: PropTypes.number
            })
        })
    };

    render() {
        const {region, bucket, key, status, size, loaded, path} = this.props.item;

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <i className={`fa fa-file-text fa-3x fa-fw ${styles.icon}`} />
                    <div className={styles.summary}>
                        <div>{region}://{bucket}/{key}</div>
                        <div>
                            {path}
                            <span className={styles.seperation}>|</span>
                            {
                                size > 1024 * 1024 * 1024
                                && `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
                            }
                            {
                                size > 1024 * 1024
                                && size < 1024 * 1024 * 1024
                                && `${(size / 1024 / 1024).toFixed(2)}MB`
                            }
                            {
                                size > 1024
                                && size < 1024 * 1024
                                && `${(size / 1024).toFixed(2)}KB`
                            }
                        </div>
                    </div>
                    <div className={styles.status}>{getText(status)}</div>
                </div>
                {
                    loaded
                    && <span
                      className={styles.loader}
                      style={{width: `${100 * loaded / size}%`}} // eslint-disable-line no-mixed-operators
                    />
                }
            </div>
        );
    }
}
