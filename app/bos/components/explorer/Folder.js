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
        name: PropTypes.string.isRequired,
        onDoubleClick: PropTypes.func.isRequired
    };

    shouldComponentUpdate(props) {
        return props.name !== this.props.name;
    }

    _triggerDoubleClick = () => {
        const {name, onDoubleClick} = this.props;
        onDoubleClick(name);
    }

    render() {
        const {name} = this.props;
        const folderName = normalize(name);

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
