/**
 * Component - SystemBar Component
 *
 * @file SystemBar.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import {Link} from 'react-router';
import React, {Component} from 'react';

import styles from './SystemBar.css';

const browserWindow = electron.remote.getCurrentWindow();

export default class SystemBar extends Component {
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
        if (process.platform === 'win32') {
            return (
                <div className={styles.windowBar}>
                    <Link to="/login">
                        <div className={`fa fa-lock ${styles.lock}`} />
                    </Link>
                    <div className={`fa fa-minus ${styles.min}`} onClick={this.minimize} />
                    <div className={`fa fa-expand ${styles.max}`} onClick={this.toggleMaximize} />
                    <div className={`fa fa-times ${styles.exit}`} onClick={this.close} />
                </div>
            );
        }

        return (
            <Link to="/login" className={styles.darwinBar}>
                <i className="fa fa-lg fa-power-off" />
            </Link>
        );
    }
}
