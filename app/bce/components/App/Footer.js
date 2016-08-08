/**
 * Component - Footer Component
 *
 * @file Footer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Link} from 'react-router';
import React, {Component} from 'react';

import styles from './Footer.css';

export default class Footer extends Component {
    render() {
        return (
            <div className={styles.container}>
                <div className={styles.left}>
                    <span className={styles.up}>
                        <i className="fa fa-arrow-up" />
                        120KB/s
                    </span>
                    <span className={styles.down}>
                        <i className="fa fa-arrow-down" />
                        120KB/s
                    </span>
                </div>
                <div className={styles.content}>
                    这里放错误信息
                </div>
                <div className={styles.right}>
                    <span className={styles.signout}>
                        <Link to="/login" >
                            <i className="fa fa-lock fa-fw" />
                        </Link>
                    </span>
                </div>
            </div>
        );
    }
}

