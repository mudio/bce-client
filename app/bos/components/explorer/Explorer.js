/**
 * Component - Explorer Component
 *
 * @file Explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import path from 'path';
import {remote} from 'electron';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Modal, notification} from 'antd';

import Navigator from './Navigator';
import styles from './Explorer.css';
import SideBar from '../app/SideBar';
import ObjectMenu from './ObjectMenu';
import ObjectWindow from './ObjectWindow';
import BucketWindow from './BucketWindow';
import Migration from './migration/Migration';

import {
    MENU_COPY_COMMAND,
    MENU_MOVE_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND
} from '../../actions/context';

import {redirect} from '../../actions/navigator';
import {trash, migration} from '../../actions/explorer';
import {createDownloadTask} from '../../actions/downloader';

export default class Explorer extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string,
        prefix: PropTypes.string,
        dispatch: PropTypes.func.isRequired
    };

    state = {
        visible: false,
        option: {}
    }

    componentDidMount() {
        const {dispatch, region, bucket, prefix} = this.props;
        dispatch(redirect({region, bucket, prefix}));
    }

    componentWillReceiveProps({region}) {
        if (region !== this.props.region) {
            redirect({region});
        }
    }

    _onCommand = (cmd, config) => {
        const {region, bucket, prefix, keys} = config;

        switch (cmd) {
        case MENU_MOVE_COMMAND:
        case MENU_COPY_COMMAND:
        case MENU_RENAME_COMMAND: {
            return this.setState({
                visible: true,
                option: {region, bucket, object: keys[0], command: cmd}
            });
        }
        case MENU_TRASH_COMMAND:
            return this._trash(region, bucket, prefix, keys);
        case MENU_DOWNLOAD_COMMAND:
            return this._download(region, bucket, prefix, keys);
        default:
        }
    }

    _download(region, bucketName, prefix, keys) {
        // 选择文件夹
        const selectPaths = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        // 用户取消了
        if (selectPaths === undefined) {
            return;
        }

        // 不支持选择多个文件夹，所以只取第一个
        const dirname = prefix.endsWith('/') ? prefix : path.posix.dirname(prefix);
        this.props.dispatch(
            createDownloadTask(region, bucketName, dirname, keys, selectPaths[0])
        );
    }

    _trash(region, bucketName, prefix, keys) {
        Modal.confirm({
            title: '删除提示',
            content: `您确定删除${keys.length}个文件吗?`,
            onOk: () => this.props.dispatch(
                trash(region, bucketName, prefix, keys)
            ).then(
                () => notification.success({message: '删除成功', description: `成功删除${keys.length}个文件`})
            )
        });
    }

    _onCancel = () => {
        this.setState({visible: false});
    }

    _onMigration = (config = {}, removeSource = false) => {
        const {
            sourceBucket, sourceObject,
            targetBucket, targetObject
        } = config;

        this.setState({visible: false});

        if (sourceBucket !== targetBucket || sourceObject !== targetObject) {
            this.props.dispatch(
                migration(config, removeSource)
            ).then(res => {
                const {errorCount, successCount} = res;
                const totalCount = errorCount + successCount;

                if (res.errorCount > 0) {
                    notification.error({
                        message: '操作未完成',
                        description: `${sourceObject} => ${targetObject}, 共计${totalCount}个文件，出错${errorCount}个`
                    });
                } else {
                    notification.success({
                        message: '操作成功',
                        description: `${sourceObject} => ${targetObject}，共计${totalCount}个文件`
                    });
                }
            });
        }
    }

    updateValue(evt) {
        const target = evt.target.value;
        const {option} = this.state;

        option.target = target;

        this.setState({option});
    }

    _renderWindow() {
        const {visible, option} = this.state;
        const {region, bucket, prefix, dispatch} = this.props;

        if (!bucket) {
            return (
                <div className={styles.body}>
                    <Navigator redirect={(...args) => dispatch(redirect(...args))} />
                    <BucketWindow region={region} dispatch={dispatch} />
                </div>
            );
        }

        return (
            <div className={styles.body}>
                <Navigator redirect={(...args) => dispatch(redirect(...args))} />
                <ObjectMenu />
                <ObjectWindow
                    region={region}
                    bucket={bucket}
                    prefix={prefix}
                    dispatch={dispatch}
                    onCommand={this._onCommand}
                />
                <Migration {...option}
                    visible={visible}
                    onMigration={this._onMigration}
                    onCancel={this._onCancel}
                />
            </div>
        );
    }

    render() {
        return (
            <div className={styles.container}>
                <SideBar />
                {this._renderWindow()}
            </div>
        );
    }
}
