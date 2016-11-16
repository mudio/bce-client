/**
 * Component - Explorer Component
 *
 * @file Explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint no-underscore-dangle: [2, { "allowAfterThis": true }] */

import {remote} from 'electron';
import React, {Component, PropTypes} from 'react';

import Url from './Url';
import Tool from './Tool';
import Window from './Window';
import styles from './Explorer.css';
import SideBar from '../App/SideBar';

import {
    MENU_TRASH_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';


const ICON_MODEL = 'icon_model';
const LIST_MODEL = 'list_model';

export default class Explorer extends Component {
    static propTypes = {
        nav: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string,
            folder: PropTypes.string
        }),
        params: React.PropTypes.shape({
            region: React.PropTypes.string
        }),
        updateNavigator: PropTypes.func.isRequired,
        download: PropTypes.func.isRequired,
        trash: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {updateNavigator} = this.props;
        updateNavigator({region: this.props.params.region});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.region !== this.props.params.region) {
            const {updateNavigator} = nextProps;
            updateNavigator({region: nextProps.params.region});
        }
    }

    _onCommand(cmd, config) {
        const {region, bucketName, prefix, keys} = config;

        switch (cmd) {
        case MENU_TRASH_COMMAND:
            return this._trash(region, bucketName, prefix, keys);
        case MENU_DOWNLOAD_COMMAND:
            return this._download(region, bucketName, prefix, keys);
        default:
            return;
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
        this.props.download(keys, path[0]);
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
            return this.props.trash(region, bucketName, prefix, keys);
        }
    }

    render() {
        const {nav, updateNavigator} = this.props;

        return (
            <div className={styles.container}>
                <SideBar />
                <div className={styles.body}>
                    <Url nav={nav} updateNavigator={updateNavigator} />
                    <Tool models={[ICON_MODEL, LIST_MODEL]} />
                    <Window nav={nav}
                        commands={[MENU_DOWNLOAD_COMMAND, MENU_TRASH_COMMAND]}
                        onCommand={(...args) => this._onCommand(...args)}
                    />
                </div>
            </div>
        );
    }
}
