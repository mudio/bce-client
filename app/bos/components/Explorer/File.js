/**
 * Component - File Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Tooltip} from 'antd';

import styles from './File.css';

export default class File extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        eTag: PropTypes.string.isRequired,
        size: PropTypes.number.isRequired,
        lastModified: PropTypes.string.isRequired,
        storageClass: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            id: PropTypes.string.isRequired,
            displayName: PropTypes.string.isRequired
        }).isRequired
    };

    render() {
        const {name} = this.props;
        const ext = name.split('.').pop().toLowerCase();
        const fileName = name.replace(/(.*\/)(.*)$/, '$2');

        return (
            <div className={styles.container}>
                <i className={`${styles.fileicon} asset-normal asset-${ext}`} />
                <Tooltip placement="bottom" title={fileName}>
                    <span className={styles.text}>
                        {fileName}
                    </span>
                </Tooltip>
            </div>
        );
    }
}
