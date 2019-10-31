/**
 * Component - Processing Component
 *
 * @file Processing.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';

import styles from './Processing.css';

class Processing extends Component {

    render() {
        const {processObjects, processedObjects} = this.props;
        if (this.props.isFetching || processObjects.length) {
            return (
                <div className="ant-modal-mask">
                    <span className={styles.loading}>
                        <i className="fa fa-spinner fa-pulse" />
                        {processObjects.length
                            ? `正在处理文件（已完成${processedObjects.length}/${processObjects.length}）`
                            : '数据加载中...'}
                    </span>
                </div>
            );
        }
        return (null);
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.processing);
}

export default connect(mapStateToProps)(Processing);
