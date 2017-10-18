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

import styles from './File.css';

function normalize(key = '') {
    return key.replace(/(.*\/)?(.*)\/$/, '$2');
}

export default class Folder extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        layout: PropTypes.string.isRequired,
        onDoubleClick: PropTypes.func.isRequired
    };

    shouldComponentUpdate(props) {
        return props.name !== this.props.name
            || props.layout !== this.props.layout;
    }

    _triggerDoubleClick = () => {
        const {name, onDoubleClick} = this.props;
        onDoubleClick(name);
    }

    render() {
        const {name, layout} = this.props;
        const folderName = normalize(name);

        if (layout === 'grid') {
            return (
                <div className={styles.gridLayout} onDoubleClick={this._triggerDoubleClick}>
                    <i className={`${styles.icon} asset-folder`} />
                    <Tooltip placement="bottom" title={folderName}>
                        <span className={styles.text}>
                            {folderName}
                        </span>
                    </Tooltip>
                </div>
            );
        }

        if (layout === 'list') {
            return (
                <div className={styles.listLayout} onDoubleClick={this._triggerDoubleClick}>
                    <i className={`${styles.icon} asset-folder`} />
                    <span className={styles.text}>{folderName}</span>
                    <span className={styles.commands}>
                        <span className="fa fa-chain" />
                        <span className="fa fa-copy" />
                        <span className="fa fa-trash" />
                    </span>
                    <span className={styles.extra}>-</span>
                    <span className={styles.extra}>-</span>
                    <span className={styles.extra}>-</span>
                </div>
            );
        }

        return null;
    }
}
