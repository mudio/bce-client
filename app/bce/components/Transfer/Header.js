/**
 * Component - Header Component
 *
 * @file Header.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import styles from './Header.css';
import SystemBar from '../Common/SystemBar';

export default class Header extends Component {
    static propTypes = {
        clearFinish: PropTypes.func.isRequired,
        createTask: PropTypes.func.isRequired
    };

    render() {
        const {clearFinish, createTask} = this.props;

        return (
            <div className={styles.container}>
                <div className={styles.body}>
                    <i title="新建任务"
                        className={`fa fa-plus ${styles.new}`}
                        onClick={createTask}
                    />
                    <i className={`fa fa-play ${styles.start}`} title="开始全部" />
                    <i className={`fa fa-pause ${styles.pause}`} title="暂停全部" />
                    <i title="清除已完成"
                        className={`fa fa-close ${styles.clear}`}
                        onClick={clearFinish}
                    />
                </div>
                <SystemBar />
            </div>
        );
    }
}
