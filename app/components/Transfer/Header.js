/**
 * Component - Header Component
 *
 * @file Header.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';

import styles from './Header.css';

export default class Header extends Component {
    render() {
        return (
            <div className={styles.container}>
                <i className={`fa fa-plus ${styles.new}`} />
                <i className={`fa fa-play ${styles.start}`} />
                <i className={`fa fa-pause ${styles.pause}`} />
                <i className={`fa fa-close ${styles.close}`} />
            </div>
        );
    }
}
