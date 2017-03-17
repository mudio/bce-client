/**
 * Component - File Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import React, {Component, PropTypes} from 'react';

import styles from './File.css';

export default class File extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        bucketName: PropTypes.string.isRequired,
        object: PropTypes.shape({
            key: PropTypes.string.isRequired,
            eTag: PropTypes.string.isRequired,
            size: PropTypes.number.isRequired,
            lastModified: PropTypes.string.isRequired
        })
    };

    render() {
        const {key} = this.props.object;
        const ext = key.split('.').pop().toLowerCase();
        const fileName = key.replace(/(.*\/)(.*)$/, '$2');

        return (
            <div className={styles.container}>
                <i className={`${styles.fileicon} asset-normal asset-${ext}`} />
                <span className={styles.text} data-tip={fileName} data-tip-align="bottom" />
            </div>
        );
    }
}
