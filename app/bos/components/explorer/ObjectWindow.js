/**
 * Component - Window Component
 *
 * @file Window.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';

import File from './File';
import Folder from './Folder';
import ObjectMenu from './ObjectMenu';
import styles from './ObjectWindow.css';
import Selection from '../common/Selection';
import ContextMenu from '../common/ContextMenu';
import * as WindowActions from '../../actions/window';
import {UploadStatus} from '../../utils/TransferStatus';
import {redirect} from '../../actions/navigator';

import {
    MENU_UPLOAD_COMMAND,
    MENU_REFRESH_COMMAND,
    MENU_COPY_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND,
    MENU_SHARE_COMMAND
} from '../../actions/context';

class Window extends Component {
    static propTypes = {
        layout: PropTypes.string.isRequired,

        region: PropTypes.string.isRequired,

        bucket: PropTypes.string.isRequired,

        // 当前筛选前缀
        prefix: PropTypes.string,
        // 数据是否正在请求
        isFetching: PropTypes.bool.isRequired,
        // 是否出错
        hasError: PropTypes.bool.isRequired,
        // 错误信息
        error: PropTypes.string,
        // 数据是否全部返回
        isTruncated: PropTypes.bool.isRequired,
        // 下次请求起点，isTruncated为true时候有效
        nextMarker: PropTypes.string,
        // 文件夹集合, 这里存放多次请求的response
        folders: PropTypes.array.isRequired,
        // 文件集合，这里存放多次请求的response
        objects: PropTypes.array.isRequired,
        listMore: PropTypes.func.isRequired,
        listObjects: PropTypes.func.isRequired,
        onCommand: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
        // 检测刷新
        uploadTask: PropTypes.shape({
            objects: PropTypes.array.isRequired,
            folders: PropTypes.array.isRequired
        })
    };

    state = {
        selectedItems: [],
        contextMenuPosition: null
    }

    componentWillReceiveProps(nextProps) {
        const {listObjects, uploadTask, bucket, prefix} = this.props;
        const objectIntersectionLen = _.intersection(uploadTask.objects, nextProps.uploadTask.objects).length;
        const folderIntersectionLen = _.intersection(uploadTask.folders, nextProps.uploadTask.folders).length;

        if (objectIntersectionLen !== uploadTask.objects.length
            || folderIntersectionLen !== uploadTask.folders.length) {
            listObjects(bucket, prefix);
        }
    }

    /**
     * 拖放文件上传
     *
     * @memberOf Window
     */
    _onDrop = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const {bucket, prefix = ''} = this.props;

        if (bucket) {
            const prefixes = prefix.split('/');
            prefixes.splice(-1, 1, '');

            this._onCommand(MENU_UPLOAD_COMMAND, {transferItems: evt.dataTransfer.items});
        }

        return false;
    }

    _onScroll = (evt) => {
        const {scrollTop, scrollHeight, clientHeight} = evt.target;
        const {bucket, prefix, nextMarker, isFetching, isTruncated, listMore} = this.props;
        const allowListMore = scrollHeight - scrollTop - clientHeight <= clientHeight / 3;

        if (!isFetching && isTruncated && bucket && allowListMore) {
            listMore(bucket, prefix, nextMarker);
        }
    }

    _onCommand = (cmd, config) => {
        const {selectedItems} = this.state;
        const {region, bucket, prefix} = this.props;

        if (config) {
            return this.props.onCommand(cmd, Object.assign({region, bucket, prefix}, config));
        }

        return this.props.onCommand(cmd, {region, bucket, prefix, keys: selectedItems});
    }

    _onSelectionChange = (keys) => {
        this.setState({selectedItems: keys, contextMenuPosition: null});
    }

    _listMore = () => {
        const {bucket, prefix, nextMarker, listMore} = this.props;

        listMore(bucket, prefix, nextMarker);
    }

    _onContextMenu = (evt) => {
        const {pageX, pageY} = evt;
        const {scrollTop} = evt.target;
        const rect = this.refs.main.getBoundingClientRect();

        this.setState({
            contextMenuPosition: {
                pageX,
                pageY,
                offsetX: pageX - rect.left,
                offsetY: pageY - rect.top + scrollTop // eslint-disable-line
            }
        });
    }

    _onDisposeContextMenu = () => {
        this.setState({contextMenuPosition: null});
    }

    _onSelectAll = evt => {
        if (evt.target.checked) {
            this._selection.selectAll();
        } else {
            this._selection.clearSelection();
        }
    }

    redirect = (prefix = '') => {
        const {bucket, dispatch} = this.props;

        dispatch(redirect({bucket, prefix}));
    }

    renderLoading() {
        if (this.props.isFetching) {
            return (
                <span className={styles.loading}>
                    <i className="fa fa-spinner fa-pulse" />
                    数据加载中...
                </span>
            );
        }
    }

    renderError() {
        const {isFetching, hasError, error} = this.props;

        if (!isFetching && hasError) {
            return (
                <span className={styles.error}>
                    <i className="fa fa-mixcloud fa-lg" />
                    错误:{error}!
                </span>
            );
        }
    }

    renderEmpty() {
        const {isFetching, hasError, folders, objects} = this.props;

        if (!isFetching
            && !hasError
            && folders.length === 0
            && objects.length === 0) {
            return (
                <span className={`fa fa-cloud-upload ${styles.nocontent}`}>
                    文件夹为空，拖拽文件上传
                </span>
            );
        }
    }

    renderMore() {
        const {isFetching, isTruncated, folders, objects} = this.props;
        const totalCount = folders.length + objects.length;
        const styleName = classnames(styles.loadMore, 'animated', 'slideInUp');

        // 数据正在加载，并且没有加载完
        if (isFetching && isTruncated) {
            return (
                <div className={styleName}>
                    <div className={styles.loadInfo} >
                        <i className="fa fa-spinner fa-pulse" aria-hidden="true" />
                        正在加载中...
                    </div>
                    <span>已加载：{totalCount}</span>
                </div>
            );
        }

        // 数据加载完毕，然而数据没有加载完
        if (!isFetching && isTruncated) {
            return (
                <div className={styleName}>
                    <div className={styles.loadInfo} >
                        <i className="fa fa-info-circle" aria-hidden="true" />
                        当前展示部分文件，滑动滚动条以加载更多！
                        <button onClick={this._listMore} >加载更多&gt;&gt;</button>
                    </div>
                    <span>已加载：{totalCount}</span>
                </div>
            );
        }

        // 数据加载完毕，并且没有更多了
        if (!isFetching && !isTruncated) {
            return null;
        }
    }

    renderListHead() {
        const {layout, folders, objects} = this.props;
        const {selectedItems} = this.state;
        const isSelectedAll = selectedItems.length === folders.length + objects.length;

        if (layout === 'list') {
            return (
                <div className={styles.head}>
                    <span className={styles.textCol}>
                        <input type="checkbox" checked={isSelectedAll} onChange={this._onSelectAll} />
                        名称 (已选{selectedItems.length}项)
                    </span>
                    <span className={styles.extraCol}>存储类型</span>
                    <span className={styles.extraCol}>大小</span>
                    <span className={styles.extraCol}>修改时间</span>
                </div>
            );
        }

        return (
            <div className={styles.head}>
                <span className={styles.textCol}>
                    <input type="checkbox" checked={isSelectedAll} onChange={this._onSelectAll} />
                    全选
                </span>
                <span>已选{selectedItems.length}项</span>
            </div>
        );
    }

    renderContextMenu() {
        const {selectedItems, contextMenuPosition} = this.state;

        if (contextMenuPosition) {
            let commands = [];

            if (selectedItems.length > 0) {
                commands = [
                    // 复制，只能复制一个文件
                    {type: MENU_COPY_COMMAND, disable: selectedItems.length !== 1},
                    // 重命名，只能操作一个文件
                    {type: MENU_RENAME_COMMAND, disable: selectedItems.length !== 1},
                    // 分享，只能分享文件
                    {type: MENU_SHARE_COMMAND, disable: selectedItems.some(item => item.endsWith('/'))},
                    {type: MENU_DOWNLOAD_COMMAND},
                    {type: MENU_TRASH_COMMAND}
                ];
            } else {
                commands = [
                    {type: MENU_UPLOAD_COMMAND},
                    {type: MENU_REFRESH_COMMAND}
                ];
            }

            return (
                <ContextMenu {...contextMenuPosition} commands={commands} onCommand={this._onCommand} />
            );
        }

        return null;
    }

    render() {
        const {folders, objects, bucket, layout} = this.props;
        const styleName = classnames({
            [styles.gridLayout]: layout === 'grid',
            [styles.listLayout]: layout === 'list'
        });

        return (
            <div className={styles.container} >
                <ObjectMenu onCommand={this._onCommand} />
                <div ref="main"
                    onDrop={this._onDrop}
                    onClick={this._onDisposeContextMenu}
                    onScroll={this._onScroll}
                    className={styles.container}
                    onContextMenu={this._onContextMenu}
                >
                    {this.renderListHead()}
                    <Selection ref={_selection => this._selection = _selection} // eslint-disable-line
                        className={styleName}
                        onSelectionChange={this._onSelectionChange}
                    >
                        {
                            folders.map((folder) => (
                                <Folder {...folder}
                                    name={folder.key}
                                    layout={layout}
                                    onCommand={this._onCommand}
                                    onDoubleClick={this.redirect}
                                />
                            ))
                        }
                        {
                            objects.map((object) => (
                                <File {...object}
                                    name={object.key}
                                    layout={layout}
                                    bucket={bucket}
                                    onCommand={this._onCommand}
                                />
                            ))
                        }
                    </Selection>
                    {this.renderMore()}
                    {this.renderLoading()}
                    {this.renderError()}
                    {this.renderEmpty()}
                    {this.renderContextMenu()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {navigator, explorer, uploads} = state;

    const uploadTask = uploads.reduce((context, task) => {
        if (task.region === navigator.region
            && task.bucket === navigator.bucket
            && task.prefix.startsWith(navigator.prefix)
            && task.status !== UploadStatus.Finish) {
            // 上传文件一定在当前目录或者子目录下
            const prefixs = task.prefix.split('/');

            if (prefixs.length > 1 && context.folders.indexOf(prefixs[0]) === -1) {
                context.folders.push(prefixs[0]);
            }

            if (prefixs.length === 1 && context.objects.indexOf(prefixs[0]) === -1) {
                context.objects.push(prefixs[0]);
            }
        }

        return context;
    }, {objects: [], folders: []});

    return Object.assign({uploadTask}, explorer);
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(WindowActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Window);
