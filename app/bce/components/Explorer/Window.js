/**
 * Component - Window Component
 *
 * @file Window.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0, no-underscore-dangle: 0 */

import u from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import React, {Component, PropTypes} from 'react';

import File from './File';
import Bucket from './Bucket';
import Folder from './Folder';
import styles from './Window.css';
import ContextMenu from './ContextMenu';
import {TRANS_FINISH} from '../../utils/TransferStatus';
import * as ExplorerActions from '../../actions/explorer';

class Window extends Component {
    static propTypes = {
        nav: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string,
            folder: PropTypes.string
        }),
        // 当前BucketName
        bucketName: PropTypes.string,
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
        // buckets集合，最多100个
        buckets: PropTypes.array.isRequired,
        // 文件夹集合, 这里存放多次请求的response
        folders: PropTypes.array.isRequired,
        // 文件集合，这里存放多次请求的response
        objects: PropTypes.array.isRequired,
        // func
        updateNavigator: PropTypes.func.isRequired,
        uploadFile: PropTypes.func.isRequired,
        refresh: PropTypes.func.isRequired,
        listMore: PropTypes.func.isRequired,
        // 检测刷新
        uploadTask: PropTypes.shape({
            objects: PropTypes.array.isRequired,
            folders: PropTypes.array.isRequired
        })
    };

    componentWillReceiveProps(nextProps) {
        const {refresh, uploadTask, nav} = this.props;
        const objectIntersectionLen = u.intersection(uploadTask.objects, nextProps.uploadTask.objects).length;
        const folderIntersectionLen = u.intersection(uploadTask.folders, nextProps.uploadTask.folders).length;

        if (objectIntersectionLen !== uploadTask.objects.length
            || folderIntersectionLen !== uploadTask.folders.length) {
            refresh(nav.bucket, nav.folder);
        }
    }

    onContextMenu(context, x, y) {
        const rect = this.refs.main.getBoundingClientRect();
        const contextMenu = this.refs._contextMenu;
        const menuRect = contextMenu.getRect();

        let offsetX = x - rect.left;
        const offsetY = y - rect.top;

        if (document.body.clientWidth - x <= menuRect.width) {
            offsetX -= menuRect.width;
        }

        contextMenu.popup(context, offsetX, offsetY + this.refs.main.scrollTop);
    }

    onDrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const {nav, uploadFile} = this.props;

        uploadFile(evt.dataTransfer.items, nav.region, nav.bucket, nav.folder);

        return false;
    }

    onDragOver(evt) {
        evt.preventDefault();
    }

    onMouseDown() {
        // TODO: 拖拽全选开启
    }

    onMouseUp() {
        // TODO: 拖拽全选结束
    }

    onMouseMove() {
        // TOOD: 拖拽中
    }

    onScroll() {
        const {scrollTop, scrollHeight, clientHeight} = this.refs.main;
        const {bucketName, prefix, nextMarker, isFetching, isTruncated, listMore} = this.props;
        const allowListMore = scrollHeight - scrollTop - clientHeight <= clientHeight / 3;

        if (!isFetching && isTruncated && bucketName && allowListMore) {
            listMore(bucketName, prefix, nextMarker);
        }
    }

    getLoading() {
        if (this.props.isFetching) {
            return (
                <span className={styles.loading}>
                    <i className="fa fa-spinner fa-pulse" />
                    数据加载中...
                </span>
            );
        }
    }

    getError() {
        const {isFetching, hasError} = this.props;

        if (!isFetching && hasError) {
            return (
                <span className={styles.error}>
                    <i className="fa fa-mixcloud" />
                    出错啦~(&gt;_&lt;)!!!
                </span>
            );
        }
    }

    getEmpty() {
        const {isFetching, hasError, buckets, folders, objects} = this.props;

        if (!isFetching
            && !hasError
            && buckets.length === 0
            && folders.length === 0
            && objects.length === 0) {
            return (
                <span className={`fa fa-cloud-upload ${styles.nocontent}`}>
                    文件夹为空，拖拽文件上传
                </span>
            );
        }
    }

    getBuckets() {
        const {buckets} = this.props;

        return buckets.map(
            (item, index) => (
                <Bucket key={index}
                    item={item}
                    onDoubleClick={bucket => this.redirect(bucket)}
                />
            )
        );
    }

    getFolders() {
        const {bucketName, prefix, folders, nav} = this.props;

        return folders.map(
            (item, index) => (
                <Folder key={index}
                    region={nav.region}
                    folder={item}
                    prefix={prefix}
                    bucketName={bucketName}
                    onDownload={(...args) => this.onDownload(...args)}
                    onContextMenu={(...args) => this.onContextMenu(...args)}
                    onDoubleClick={folder => this.redirect(bucketName, folder)}
                />
            )
        );
    }

    getObejcts() {
        const {bucketName, prefix, objects, nav} = this.props;

        return objects.map(
            (object, index) => (
                <File key={index}
                    region={nav.region}
                    object={object}
                    prefix={prefix}
                    bucketName={bucketName}
                    onDownload={(...args) => this.onDownload(...args)}
                    onContextMenu={(...args) => this.onContextMenu(...args)}
                />
            )
        );
    }

    getMore() {
        const {isFetching, isTruncated, bucketName, prefix, nextMarker, listMore} = this.props;

        // 数据正在加载，并且没有加载完
        if (isFetching && isTruncated) {
            return (
                <div className={styles.loadMore}>
                    <i className="fa fa-spinner fa-pulse fa-lg" aria-hidden="true" />
                    正在加载中...
                </div>
            );
        }

        // 数据加载完毕，然而数据没有加载完
        if (!isFetching && isTruncated) {
            return (
                <div className={styles.loadMore}>
                    <button onClick={() => listMore(bucketName, prefix, nextMarker)}>加载更多&gt;&gt;</button>
                </div>
            );
        }

        // 数据加载完毕，并且没有更多了
        if (!isFetching && !isTruncated) {
            return '';
        }
    }

    redirect(bucket = '', folder = '') {
        const {nav, updateNavigator} = this.props;
        updateNavigator({region: nav.region, bucket, folder});
    }

    render() {
        return (
            <div ref="main"
                className={styles.container}
                onDragOver={evt => this.onDragOver(evt)}
                onDrop={evt => this.onDrop(evt)}
                onClick={() => this.refs._contextMenu.hide()}
                onMouseUp={evt => this.onMouseUp(evt)}
                onMouseDown={evt => this.onMouseDown(evt)}
                onMouseMove={evt => this.onMouseMove(evt)}
                onScroll={evt => this.onScroll(evt)}
            >
                {this.getLoading()}
                {this.getError()}
                {this.getEmpty()}
                {this.getBuckets()}
                {this.getFolders()}
                {this.getObejcts()}
                {this.getMore()}
                <ContextMenu ref="_contextMenu" />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {navigator, explorer, uploads} = state;

    const uploadTask = uploads.reduce((context, task) => {
        if (task.region === navigator.region
            && task.bucket === navigator.bucket
            && task.object.startsWith(navigator.folder)
            && task.status !== TRANS_FINISH) {
            // 上传文件一定在当前目录或者子目录下
            const prefixs = task.object.split('/');

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
    return bindActionCreators(ExplorerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Window);
