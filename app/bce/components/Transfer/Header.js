/**
 * Component - Header Component
 *
 * @file Header.js
 * @author mudio(job.mudio@gmail.com)
 */

import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './Header.css';
import SystemBar from '../Common/SystemBar';
import {clearFinish} from '../../actions/transfer';

export default class Header extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        transType: PropTypes.string.isRequired
    };

    _onClearFinish() {
        const {dispatch, transType} = this.props;
        dispatch(clearFinish(transType));
    }

    render() {
        return (
            <div className={styles.container}>
                <div className={styles.body}>
                    <div className={classnames(styles.btn, styles.start)} >
                        <i className="fa fa-play fa-fw" title="开始全部" />
                        开始全部
                    </div>
                    <div className={classnames(styles.btn, styles.pause)} >
                        <i className="fa fa-pause fa-fw" title="暂停全部" />
                        暂停全部
                    </div>
                    <div className={classnames(styles.btn, styles.clear)}
                        onClick={() => this._onClearFinish()}
                    >
                        <i title="清除已完成" className="fa fa-trash fa-fw" />
                        清除已完成
                    </div>
                </div>
                <SystemBar />
            </div>
        );
    }
}
