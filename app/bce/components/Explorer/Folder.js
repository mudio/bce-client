/**
 * Component - Folder Component
 *
 * @file Folder.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {remote} from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import React, {Component, PropTypes} from 'react';

import styles from './Folder.css';
import * as ExplorerActons from '../../actions/explorer';

function normalize(key = '') {
    return key.replace(/(.*\/)?(.*)\/$/, '$2');
}

class Folder extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        bucketName: PropTypes.string.isRequired,
        folder: PropTypes.shape({
            key: PropTypes.string.isRequired
        }),
        onDoubleClick: PropTypes.func.isRequired,
        onContextMenu: PropTypes.func.isRequired,
        view: PropTypes.func.isRequired,
        rename: PropTypes.func.isRequired,
        share: PropTypes.func.isRequired,
        download: PropTypes.func.isRequired,
        copy: PropTypes.func.isRequired,
        move: PropTypes.func.isRequired,
        trash: PropTypes.func.isRequired
    };

    _trash() {
        const {region, bucketName, prefix, folder, trash} = this.props;

        const comfirmTrash = !remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            message: `您确定删除${normalize(folder.key)}文件夹?`,
            title: '删除提示',
            buttons: ['删除文件夹', '取消'],
            cancelId: 1
        });

        if (comfirmTrash) {
            trash(region, bucketName, prefix, [folder.key]);
        }
    }

    _onDownload() {
        // 选择文件夹
        const {download, folder} = this.props;
        const path = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        // 用户取消了
        if (path === undefined) {
            return;
        }
        // 不支持选择多个文件夹，所以只取第一个
        download(folder.key, path[0]);
    }

    _onContextMenu(evt) {
        evt.preventDefault();
        const {
            onContextMenu,
            // item, view, rename, copy, move, trash
        } = this.props;

        onContextMenu([
            // {name: '查看', icon: 'low-vision', click: () => view(item, FolderType)},
            // {name: '重命名', icon: 'pencil', click: () => rename(item, FolderType)},
            {name: '下载', icon: 'cloud-download', click: () => this._onDownload()},
            // {name: '复制', icon: 'copy', click: () => copy(item, FolderType)},
            // {name: '移动到', icon: 'arrows', click: () => move(item, FolderType)},
            {name: '删除', icon: 'trash', click: () => this._trash()}
        ], evt.clientX, evt.clientY);
    }

    render() {
        const {folder, onDoubleClick} = this.props;

        return (
            <div className={styles.container}
                onContextMenu={evt => this._onContextMenu(evt)}
                onDoubleClick={() => onDoubleClick(folder.key)}
            >
                <i className={`fa fa-4x fa-folder ${styles.folder}`} />
                <span className={styles.text} title={normalize(folder.key)}>
                    {normalize(folder.key)}
                </span>
            </div>
        );
    }
}

function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ExplorerActons, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Folder);

