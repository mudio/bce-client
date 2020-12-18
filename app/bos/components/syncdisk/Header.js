/**
 * Component - Header Component
 *
 * @file Header.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Button} from 'antd';

import styles from './Header.css';

export default class Header extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        visible: PropTypes.bool,
        dataSource: PropTypes.array.isRequired,
        onNewTask: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        selectedItems: PropTypes.array.isRequired
    };

    render() {
        const totalSize = this.props.dataSource.length;
        return (
            <div className={styles.container}>
                <div className={styles.body}>
                    <div className={styles.layoutLeft}>
                        <Button type="primary" onClick={this.props.onNewTask} disabled={totalSize >= 20}>新建同步映射</Button>
                        <Button onClick={this.props.onDelete} disabled={!this.props.selectedItems.length}>批量删除</Button>
                        <span className={styles.tip}>已全部加载，共{totalSize}个</span>
                    </div>
                    {/* <Button onClick={this.props.onRefresh} icon="sync" className={styles.layoutRight} /> */}
                </div>
            </div>
        );
    }
}
