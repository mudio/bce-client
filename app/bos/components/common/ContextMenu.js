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
import {commandMap} from '../../actions/context';

export default class ContextMenu extends Component {
    static propTypes = {
        pageX: PropTypes.number.isRequired,
        pageY: PropTypes.number.isRequired,
        offsetX: PropTypes.number.isRequired,
        offsetY: PropTypes.number.isRequired,
        commands: PropTypes.array.isRequired,
        onCommand: PropTypes.func.isRequired
    };

    render() {
        const {offsetX, offsetY, pageX, pageY, commands, onCommand} = this.props;
        const datasource = commands.map(
            item => Object.assign({disable: !!item.disable}, commandMap[item.type])
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
