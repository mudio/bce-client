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

import {
    commandMap,
    MENU_COPY_COMMAND,
    // MENU_MOVE_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';
import styles from './File.css';

function normalize(key = '') {
    return key.replace(/(.*\/)?(.*)\/$/, '$2');
}

export default class Folder extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        layout: PropTypes.string.isRequired,
        onCommand: PropTypes.func.isRequired,
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

    static supportCommands = [
        MENU_RENAME_COMMAND,
        MENU_COPY_COMMAND,
        // MENU_MOVE_COMMAND,
        MENU_DOWNLOAD_COMMAND,
        MENU_TRASH_COMMAND
    ];

    renderCommands() {
        const {name, onCommand} = this.props;

        return Folder.supportCommands.map(command => {
            const {icon} = commandMap[command];

            return (
                <span key={command.toString()}
                    className={`fa fa-${icon}`}
                    onClick={() => onCommand(command, {keys: [name]})}
                />
            );
        });
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
                        {this.renderCommands()}
                    </span>
                    <span className={styles.storage}>--</span>
                    <span className={styles.extra}>--</span>
                    <span className={styles.time}>--</span>
                </div>
            );
        }

        return null;
    }
}
