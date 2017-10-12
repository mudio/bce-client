/**
 * Component - Window Component
 *
 * @file Window.js
 * @author mudio(job.mudio@gmail.com)
 */

import u from 'lodash';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';

import File from './File';
import Folder from './Folder';
import styles from './Window.css';
import Selection from '../Common/Selection';
import {redirect} from '../../actions/navigator';
import {UploadStatus} from '../../utils/TransferStatus';
import * as WindowActions from '../../actions/window';

import {
    MENU_COPY_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';

class Window extends Component {
    static propTypes = {
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
        // func
        uploadFile: PropTypes.func.isRequired,
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
        commands: []
    }

    componentWillReceiveProps(nextProps) {
        const {listObjects, uploadTask, bucket, prefix} = this.props;
        const objectIntersectionLen = u.intersection(uploadTask.objects, nextProps.uploadTask.objects).length;
        const folderIntersectionLen = u.intersection(uploadTask.folders, nextProps.uploadTask.folders).length;

        if (objectIntersectionLen !== uploadTask.objects.length
            || folderIntersectionLen !== uploadTask.folders.length) {
            listObjects(bucket, prefix);
        }
    }

    _onDrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const {region, bucket, prefix, uploadFile} = this.props;

        if (bucket) {
            const prefixes = prefix.split('/');
            prefixes.splice(-1, 1, '');

            uploadFile(evt.dataTransfer.items, region, bucket, prefixes.join('/'));
        }

        return false;
    }

    _onScroll() {
        const {scrollTop, scrollHeight, clientHeight} = this.refs.main;
        const {bucket, prefix, nextMarker, isFetching, isTruncated, listMore} = this.props;
        const allowListMore = scrollHeight - scrollTop - clientHeight <= clientHeight / 3;

        if (!isFetching && isTruncated && bucket && allowListMore) {
            listMore(bucket, prefix, nextMarker);
        }
    }

    _onCommand(cmd, config) {
        const {region, bucket, prefix} = this.props;

        return this.props.onCommand(cmd, Object.assign({region, bucket, prefix}, config));
    }

    _onSelectionChange(keys) {
        this.setState({
            commands: [
                {type: MENU_COPY_COMMAND, disable: keys.length !== 1},
                {type: MENU_RENAME_COMMAND, disable: keys.length !== 1},
                {type: MENU_DOWNLOAD_COMMAND},
                {type: MENU_TRASH_COMMAND}
            ]
        });
    }

    _listMore = () => {
        const {bucket, prefix, nextMarker, listMore} = this.props;

        listMore(bucket, prefix, nextMarker);
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

    renderContents() {
        return (
            <Selection commands={this.state.commands}
                onSelectionChange={(...args) => this._onSelectionChange(...args)}
                onCommand={(...args) => this._onCommand(...args)}
            >
                {this.renderFolders()}
                {this.renderObejcts()}
            </Selection>
        );
    }

    renderFolders() {
        const {folders} = this.props;

        return folders.map((folder) => (
            <Folder name={folder.key} {...folder} onDoubleClick={this.redirect} />
        ));
    }

    renderObejcts() {
        const {objects} = this.props;

        return objects.map((object) => (
            <File name={object.key} {...object} />
        ));
    }

    renderMore() {
        const {isFetching, isTruncated} = this.props;

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
                    <button onClick={this._listMore} >加载更多&gt;&gt;</button>
                </div>
            );
        }

        // 数据加载完毕，并且没有更多了
        if (!isFetching && !isTruncated) {
            return '';
        }
    }

    render() {
        return (
            <div ref="main"
                className={styles.container}
                onDrop={evt => this._onDrop(evt)}
                onScroll={evt => this._onScroll(evt)}
            >
                {this.renderLoading()}
                {this.renderError()}
                {this.renderEmpty()}
                {this.renderContents()}
                {this.renderMore()}
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
