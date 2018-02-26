/**
 * Component - SystemBar Component
 *
 * @file SystemBar.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './SystemBar.css';
import {isOSX} from '../../../utils';

const browserWindow = electron.remote.getCurrentWindow();

export default class SystemBar extends Component {
    static propTypes = {
        resize: PropTypes.bool
    }

    close() {
        browserWindow.close();
    }

    toggleMaximize() {
        if (browserWindow.isMaximized()) {
            browserWindow.unmaximize();
        } else {
            browserWindow.maximize();
        }
    }

    minimize() {
        browserWindow.minimize();
    }

    render() {
        if (isOSX) {
            return null;
        }

        const {resize} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.title} >
                    {electron.remote.app.getName()}
                </div>
                {resize && <div className={`fa fa-minus ${styles.min}`} onClick={this.minimize} />}
                {resize && <div className={`fa fa-expand ${styles.max}`} onClick={this.toggleMaximize} />}
                <div className={`fa fa-times ${styles.exit}`} onClick={this.close} />
            </div>
        );
    }
}
