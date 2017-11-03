/**
 * Component - ObjectMenu Component
 *
 * @file ObjectMenu.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Button} from 'antd';
import {remote} from 'electron';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';

import styles from './ObjectMenu.css';
import {syncLayout} from '../../actions/explorer';

class ObjectMenu extends Component {
    static propTypes = {
        layout: PropTypes.string.isRequired,
        onUpload: PropTypes.func.isRequired,
        syncLayout: PropTypes.func.isRequired
    }

    _onUpload = () => {
        // 选择文件夹
        const selectPaths = remote.dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory', 'multiSelections']
        });
        // 用户取消了
        if (selectPaths === undefined) {
            return;
        }

        this.props.onUpload(selectPaths);
    }

    _handleModelChange = layout => {
        this.props.syncLayout(layout);
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
