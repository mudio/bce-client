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
import {isWin} from '../../../utils';
import {syncLayout} from '../../actions/explorer';
import {
    MENU_UPLOAD_COMMAND,
    MENU_REFRESH_COMMAND,
    MENU_NEW_DIRECTORY_COMMAND,
    MENU_UPLOAD_DIRECTORY_COMMAND
} from '../../actions/context';

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

    _onUploadDirectory= () => {
        this.props.onCommand(MENU_UPLOAD_DIRECTORY_COMMAND);
    }

    /**
     * 派发一个新建文件夹消息
     *
     * @memberOf ObjectMenu
     */
    _onCreateFolder = () => {
        this.props.onCommand(MENU_NEW_DIRECTORY_COMMAND);
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

        /**
         * Note:
         * On Windows and Linux an open dialog can not be both a file selector and a directory selector,
         * so if you set properties to ['openFile', 'openDirectory'] on these platforms,
         * a directory selector will be shown.
         */
        const fakeMenuBar = () => {
            const uploadDirectory = isWin ? <Button type="primary" size="small" icon="upload"
                onClick={this._onUploadDirectory}>上传目录</Button> : null;
            return (
                <div className={styles.layoutLeft}>
                    <Button type="primary" size="small" icon="upload" onClick={this._onUpload}>上传</Button>
                    {uploadDirectory}
                    <Button type="primary" size="small" icon="plus" onClick={this._onCreateFolder}>新建文件夹</Button>
                </div>
            );
        };

        return (
            <div className={styles.container}>
                {fakeMenuBar()}
                <div className={styles.btnGroup}>
                    <span className={gridStyle} onClick={() => this._handleModelChange('grid')}>
                        <i className="fa fa-lg fa-th" />
                    </span>
                    <span className={listStyle} onClick={() => this._handleModelChange('list')}>
                        <i className="fa fa-lg fa-list-ul" />
                    </span>
                </div>
                <div className={styles.layoutRight}>
                    <span className={styles.btn} onClick={this._onRefresh}>
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
