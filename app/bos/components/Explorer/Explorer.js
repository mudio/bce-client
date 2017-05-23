/**
 * Component - Explorer Component
 *
 * @file Explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import {remote} from 'electron';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Url from './Url';
import Move from './Move';
import Window from './Window';
import styles from './Explorer.css';
import SideBar from '../App/SideBar';
import Modal from '../Common/Modal';

import {
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';

import {redirect, trash} from '../../actions/explorer';
import {createDownloadTask} from '../../actions/downloader';

export default class Explorer extends Component {
    static propTypes = {
        nav: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string,
            prefix: PropTypes.string
        }),
        dispatch: PropTypes.func.isRequired
    };

    componentDidMount() {
        const {dispatch, nav} = this.props;
        dispatch(redirect(nav.region, nav.bucket, nav.prefix));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.nav.region !== this.props.nav.region) {
            redirect(nextProps.nav.region);
        }
    }

    _onCommand(cmd, config) {
        const {region, bucketName, prefix, keys} = config;

        switch (cmd) {
        case MENU_RENAME_COMMAND:
            return this.refs._rename.show({region, bucket: bucketName, prefix, keys});
        case MENU_TRASH_COMMAND:
            return this._trash(region, bucketName, prefix, keys);
        case MENU_DOWNLOAD_COMMAND:
            return this._download(region, bucketName, prefix, keys);
        default:
        }
    }

    _download(region, bucketName, prefix, keys) {
        // 选择文件夹
        const path = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        // 用户取消了
        if (path === undefined) {
            return;
        }
        // 不支持选择多个文件夹，所以只取第一个
        this.props.dispatch(
            createDownloadTask(region, bucketName, prefix, keys, path[0])
        );
    }

    _trash(region, bucketName, prefix, keys) {
        const comfirmTrash = !remote.dialog.showMessageBox(
            remote.getCurrentWindow(),
            {
                message: `您确定删除${keys.length}个文件吗?`,
                title: '删除提示',
                buttons: ['删除', '取消'],
                cancelId: 1
            }
        );

        if (comfirmTrash) {
            this.props.dispatch(
                trash(region, bucketName, prefix, keys)
            );
        }
    }

    render() {
        const {nav, dispatch} = this.props;

        return (
            <div className={styles.container}>
                <SideBar />
                <div className={styles.body}>
                    <Url redirect={(...args) => dispatch(redirect(...args))} />
                    <Window nav={nav}
                        onCommand={(...args) => this._onCommand(...args)}
                        redirect={(...args) => dispatch(redirect(...args))}
                    />
                </div>
                <Modal ref="_rename" title="重命名" width="400">
                    <Move />
                </Modal>
            </div>
        );
    }
}
