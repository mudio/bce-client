/**
 * Component - UploadItem Component
 *
 * @file UploadItem.js
 * @author mudio(job.mudio@gmail.com)
 */

import styles from './UploadItem.css';
import {getText} from '../../utils/TransferStatus';
import React, {Component, PropTypes} from 'react';

export default class UploadItem extends Component {
    static propTypes = {
        item: PropTypes.shape({
            filePath: PropTypes.string.isRequired,
            fileSize: PropTypes.number.isRequired,
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired,
            process: PropTypes.shape({
                rate: PropTypes.number,
                schedule: PropTypes.number
            })
        })
    };

    render() {
        const {item} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <i className={`fa fa-file-text fa-3x fa-fw ${styles.icon}`} />
                    <div className={styles.summary}>
                        <div>{item.region}://{item.bucket}/{item.key}</div>
                        <div>
                            {
                                item.fileSize > 1024 * 1024 * 1024
                                && `${(item.fileSize / 1024 / 1024 / 1024).toFixed(2)}GB`
                            }
                            {
                                item.fileSize > 1024 * 1024
                                && item.fileSize < 1024 * 1024 * 1024
                                && `${(item.fileSize / 1024 / 1024).toFixed(2)}MB`
                            }
                            {
                                item.fileSize > 1024
                                && item.fileSize < 1024 * 1024
                                && `${(item.fileSize / 1024).toFixed(2)}KB`
                            }
                        </div>
                    </div>
                    <div className={styles.status}>{getText(item.status)}</div>
                </div>
                {
                    item.loaded
                    && <span
                      className={styles.loader}
                      style={{width: `${100 * item.loaded / item.fileSize}%`}}
                    />
                }
            </div>
        );
    }
}
