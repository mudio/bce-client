/**
 * Component - ContextMenu Component
 *
 * @file ContextMenu.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0 */

import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, {Component} from 'react';

import styles from './ContextMenu.css';
import {
    MENU_COPY_COMMAND,
    MENU_MOVE_COMMAND,
    MENU_VIEW_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_SHARE_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';

export default class ContextMenu extends Component {
    static propTypes = {
        pageX: PropTypes.number.isRequired,
        pageY: PropTypes.number.isRequired,
        offsetX: PropTypes.number.isRequired,
        offsetY: PropTypes.number.isRequired,
        commands: PropTypes.array.isRequired,
        onCommand: PropTypes.func.isRequired
    };

    static menuCommands = {
        [MENU_COPY_COMMAND]: {name: '复制到', icon: 'copy', command: MENU_COPY_COMMAND},
        [MENU_TRASH_COMMAND]: {name: '删除', icon: 'trash', command: MENU_TRASH_COMMAND},
        [MENU_SHARE_COMMAND]: {name: '分享', icon: 'chain', command: MENU_SHARE_COMMAND},
        [MENU_MOVE_COMMAND]: {name: '移动到', icon: 'arrows', command: MENU_MOVE_COMMAND},
        [MENU_VIEW_COMMAND]: {name: '查看', icon: 'low-vision', command: MENU_VIEW_COMMAND},
        [MENU_RENAME_COMMAND]: {name: '重命名', icon: 'pencil', command: MENU_RENAME_COMMAND},
        [MENU_DOWNLOAD_COMMAND]: {name: '下载', icon: 'cloud-download', command: MENU_DOWNLOAD_COMMAND}
    };

    render() {
        const {offsetX, offsetY, pageX, pageY, commands, onCommand} = this.props;
        const datasource = commands.map(item => Object.assign(
            {disable: !!item.disable},
            ContextMenu.menuCommands[item.type])
        );

        let left = offsetX;
        let top = offsetY;

        if (document.body.clientWidth - pageX <= 120) {
            left -= 120;
        }
        if (document.body.clientHeight - pageY <= datasource.length * 30) {
            top -= datasource.length * 30;
        }

        return (
            <div className={styles.container} style={{left, top}}>
                {
                    datasource.map((item, index) => {
                        const style = classnames(
                            styles.menuItem,
                            {[styles.disabled]: item.disable},
                            {[styles.trash]: item.icon === 'trash'}
                        );

                        return (
                            <div key={index}
                                className={style}
                                onClick={() => !item.disable && onCommand(item.command)}
                            >
                                <i className={`fa fa-${item.icon} fa-fw`} />
                                {item.name}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}
