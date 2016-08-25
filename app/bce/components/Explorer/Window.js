/**
 * Component - Window Component
 *
 * @file Window.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0 */

import u from 'underscore';
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
        response: PropTypes.shape({
            buckets: PropTypes.array.isRequired,
            folders: PropTypes.array.isRequired,
            objects: PropTypes.array.isRequired,
            name: PropTypes.string,
            prefix: PropTypes.string,
            delimiter: PropTypes.string,
            marker: PropTypes.string,
            maxKeys: PropTypes.number,
            isTruncated: PropTypes.boolean
        }),
        isFetching: PropTypes.bool.isRequired,
        didInvalidate: PropTypes.bool.isRequired,
        updateNavigator: PropTypes.func.isRequired,
        uploadFile: PropTypes.func.isRequired,
        refresh: PropTypes.func.isRequired,
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
        const contextMenu = this.refs._contextMenu; // eslint-disable-line no-underscore-dangle
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
        const {nav, uploadFile} = this.props;

        uploadFile(evt.dataTransfer.items, nav.region, nav.bucket, nav.folder);

        return false;
    }

    onDragOver(evt) {
        evt.preventDefault();
    }

    redirect(bucket = '', folder = '') {
        const {nav, updateNavigator} = this.props;
        updateNavigator({region: nav.region, bucket, folder});
    }

    render() {
        const {nav, isFetching, didInvalidate, response} = this.props;
        const {buckets, folders, objects} = response;

        return (
            <div
              ref="main"
              className={styles.container}
              onDragOver={evt => this.onDragOver(evt)}
              onDrop={evt => this.onDrop(evt)}
              onClick={() => this.refs._contextMenu.hide()} // eslint-disable-line no-underscore-dangle
            >
                {
                    isFetching
                    && <span className={styles.loading}>
                        <i className="fa fa-spinner fa-pulse" />
                        数据加载中...
                    </span>
                }
                {
                    !isFetching
                    && didInvalidate
                    && <span className={styles.error}>
                        <i className="fa fa-mixcloud" />
                        出错啦~(&gt;_&lt;)!!!
                    </span>
                }
                {
                    !isFetching
                    && !didInvalidate
                    && buckets.length === 0
                    && folders.length === 0
                    && objects.length === 0
                    && <span className={`fa fa-cloud-upload ${styles.nocontent}`}>文件夹为空，拖拽文件上传</span>
                }
                {
                    !isFetching
                    && buckets.map((item, index) => (
                        <Bucket
                          key={index}
                          item={item}
                          onDoubleClick={bucket => this.redirect(bucket)}
                        />
                    ))
                }
                {
                    !isFetching
                    && folders.map((item, index) => (
                        <Folder
                          key={index}
                          item={item}
                          onDownload={(...args) => this.onDownload(...args)}
                          onContextMenu={(...args) => this.onContextMenu(...args)}
                          onDoubleClick={folder => this.redirect(nav.bucket, folder)}
                        />
                    ))
                }
                {
                    !isFetching
                    && objects.map((item, index) => (
                        <File
                          key={index}
                          item={item}
                          onDownload={(...args) => this.onDownload(...args)}
                          onContextMenu={(...args) => this.onContextMenu(...args)}
                        />
                    ))
                }
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
            && task.key.startsWith(navigator.folder)
            && task.status !== TRANS_FINISH) {
            // 上传文件一定在当前目录或者子目录下
            const prefixs = task.key.split('/');

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
