/**
 * Component - Move Component
 *
 * @file Move.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';

import styles from './Move.css';

export default class Move extends Component {
    props: {
        keys: Array.isRequired,
        region: String.isRequired,
        bucket: String,
        prefix: String
    };

    render() {
        const {region, bucket, prefix, keys} = this.props;

        return (
            <div className={styles.container} >
                <div>
                    <span>地域:</span>
                    <span>{region}{bucket}{prefix}{keys}</span>
                </div>
                <div>
                    <span>迁移文件:</span>
                    <input />
                </div>
            </div>
        );
    }
}
