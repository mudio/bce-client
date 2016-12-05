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
import {TransCategory} from '../../utils/BosType';
import {clearFinish} from '../../actions/transfer';

export default class Header extends Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        category: PropTypes.string.isRequired
    };

    _onClearFinish() {
        const {dispatch} = this.props;
        dispatch(clearFinish());
    }

    renderCategory() {
        const {category} = this.props;

        switch (category) {
        case TransCategory.Upload:
        case TransCategory.Download:
            return (
                <div className={styles.body}>
                    <div className={classnames(styles.btn, styles.start)} >
                        <i className="fa fa-play fa-fw" title="开始全部" />
                        开始全部
                    </div>
                    <div className={classnames(styles.btn, styles.pause)} >
                        <i className="fa fa-pause fa-fw" title="暂停全部" />
                        暂停全部
                    </div>
                </div>
            );
        case TransCategory.Complete:
            return (
                <div className={styles.body}>
                    <div className={classnames(styles.btn, styles.clear)}
                        onClick={() => this._onClearFinish()}
                    >
                        <i title="清除已完成" className="fa fa-trash fa-fw" />
                        清除已完成
                    </div>
                </div>
            );
        default:
            return null;
        }
    }
    render() {
        return (
            <div className={styles.container}>
                {this.renderCategory()}
                <SystemBar />
            </div>
        );
    }
}
