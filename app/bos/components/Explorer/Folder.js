/**
 * Component - Folder Component
 *
 * @file Folder.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

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

    render() {
        const {folder, onDoubleClick} = this.props;

        return (
            <div className={styles.container} onDoubleClick={() => onDoubleClick(folder.key)}>
                <i className={`${styles.foldericon} asset-folder`} />
                <span className={styles.text} data-tip={normalize(folder.key)} data-tip-align="bottom" />
            </div>
        );
    }
}
