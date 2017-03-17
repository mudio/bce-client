/**
 * Component - Tool Component
 *
 * @file Tool.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';
import styles from './Tool.css';

export default class Tool extends Component {
    render() {
        return (
            <div className={styles.container}>
                『平铺』『列表』  『上传』『下载』『删除』『移动』『权限』
            </div>
        );
    }
}
