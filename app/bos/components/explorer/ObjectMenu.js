/**
 * Component - ObjectMenu Component
 *
 * @file ObjectMenu.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Button} from 'antd';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';

import styles from './ObjectMenu.css';
import {syncLayout} from '../../actions/explorer';
import {MENU_UPLOAD_COMMAND, MENU_REFRESH_COMMAND} from '../../actions/context';

class ObjectMenu extends Component {
    static propTypes = {
        layout: PropTypes.string.isRequired,
        onCommand: PropTypes.func.isRequired,
        syncLayout: PropTypes.func.isRequired
    }

    /**
     * 切换资源展示模式
     *
     * @memberOf ObjectMenu
     */
    _handleModelChange = layout => {
        this.props.syncLayout(layout);
    }

    /**
     * 派发一个上传消息
     *
     * @memberOf ObjectMenu
     */
    _onUpload = () => {
        this.props.onCommand(MENU_UPLOAD_COMMAND);
    }

    /**
     * 派发一个刷新消息
     *
     * @memberOf ObjectMenu
     */
    _onRefresh = () => {
        this.props.onCommand(MENU_REFRESH_COMMAND);
    }

    render() {
        const {layout} = this.props;
        const gridStyle = classnames(styles.btn, {
            [styles.checked]: layout === 'grid'
        });
        const listStyle = classnames(styles.btn, {
            [styles.checked]: layout === 'list'
        });

        return (
            <div className={styles.container}>
                <div className={styles.layoutLeft}>
                    <Button type="primary" icon="upload" onClick={this._onUpload}>上传</Button>
                </div>
                <div className={styles.btnGroup}>
                    <span className={gridStyle} onClick={() => this._handleModelChange('grid')} >
                        <i className="fa fa-lg fa-th" />
                    </span>
                    <span className={listStyle} onClick={() => this._handleModelChange('list')} >
                        <i className="fa fa-lg fa-list-ul" />
                    </span>
                </div>
                <div className={styles.layoutRight}>
                    <span className={styles.btn} onClick={this._onRefresh} >
                        <i className="fa fa-lg fa-refresh" />
                    </span>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {layout: state.explorer.layout};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({syncLayout}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ObjectMenu);
