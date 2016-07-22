/**
 * Component - Header Component
 *
 * @file Header.js
 * @author mudio(job.mudio@gmail.com)
 */

import styles from './Header.css';
import React, {Component} from 'react';

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
