/**
 * Component - Folder Component
 *
 * @file Folder.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {Tooltip} from 'antd';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './Folder.css';

function normalize(key = '') {
    return key.replace(/(.*\/)?(.*)\/$/, '$2');
}

export default class Folder extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        bucketName: PropTypes.string.isRequired,
        folder: PropTypes.shape({
            key: PropTypes.string.isRequired
        }),
        onDoubleClick: PropTypes.func.isRequired
    };

    _triggerDoubleClick = () => {
        const {folder, onDoubleClick} = this.props;
        onDoubleClick(folder.key);
    }

    render() {
        const {folder} = this.props;
        const folderName = normalize(folder.key);

        return (
            <div className={styles.container} onDoubleClick={this._triggerDoubleClick}>
                <i className={`${styles.foldericon} asset-folder`} />
                <Tooltip placement="bottom" title={folderName}>
                    <span className={styles.text}>
                        {folderName}
                    </span>
                </Tooltip>
            </div>
        );
    }
}
