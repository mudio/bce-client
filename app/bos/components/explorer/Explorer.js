/**
 * Component - Explorer Component
 *
 * @file Explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import u from 'underscore';
import path from 'path';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {remote, clipboard} from 'electron';
import {Modal, notification, message} from 'antd';

import Navigator from './Navigator';
import styles from './Explorer.css';
import SideBar from '../app/SideBar';
import {isOSX} from '../../../utils';
import ObjectWindow from './ObjectWindow';
import BucketWindow from './BucketWindow';
import NewFolder from './NewFolder';
import logger from '../../../utils/logger';
import {getUuid} from '../../../utils/helper';
import SystemBar from '../common/SystemBar';
import Migration from './migration/Migration';
import NewMapping from '../syncdisk/NewMapping';
import {ClientFactory} from '../../api/client';
import {createDownloadTask} from '../../actions/downloader';
import {uploadByDropFile, uploadBySelectPaths} from '../../actions/uploader';
import {listObjects, deleteObject, migrationObject, createFolder} from '../../actions/window';

import {
    MENU_UPLOAD_COMMAND,
    MENU_UPLOAD_DIRECTORY_COMMAND,
    MENU_REFRESH_COMMAND,
    MENU_COPY_COMMAND,
    MENU_MOVE_COMMAND,
    MENU_TRASH_COMMAND,
    MENU_RENAME_COMMAND,
    MENU_DOWNLOAD_COMMAND,
    MENU_SHARE_COMMAND,
    MENU_NEW_DIRECTORY_COMMAND,
    MENU_NEW_MAPPING_COMMAND
} from '../../actions/context';
import {
    SYNCDISK_NEW_MAPPING,
    SYNCDISK_CHANGE_NEWMAPPING,
    SYNCDISK_CHANGE_SIGNAL,
    changeBosPath
} from '../../actions/syncdisk';

export default class Explorer extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,
        bucket: PropTypes.string,
        prefix: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
        syncdisk: PropTypes.shape({
            localPath: PropTypes.string,
            bosPath: PropTypes.string,
            mappings: PropTypes.array.isRequired
        })
    };

    state = {
        visible: false,
        newFolder: false,
        option: {}
    }

    saveFormRef = form => {
        this.form = form;
    }

    _onCommand = (cmd, config) => {
        const {bucket, prefix = '', keys} = config;
        const {dispatch} = this.props;
        const bosPath = prefix ? `${bucket}/${prefix}` : `${bucket}/`;

        switch (cmd) {
        case MENU_UPLOAD_COMMAND:
            return this._onUploadFile(config);
        case MENU_UPLOAD_DIRECTORY_COMMAND:
            return this._onUploadFile(config, 'openDirectory');
        case MENU_NEW_DIRECTORY_COMMAND:
            return this.setState({
                newFolder: true,
                option: {bucket, command: cmd}
            });
        case MENU_REFRESH_COMMAND:
            return this._onReresh();
        case MENU_MOVE_COMMAND:
        case MENU_COPY_COMMAND:
        case MENU_RENAME_COMMAND: {
            return this.setState({
                visible: true,
                option: {bucket, object: keys[0], command: cmd}
            });
        }
        case MENU_TRASH_COMMAND:
            return this._trash(bucket, prefix, keys);
        case MENU_DOWNLOAD_COMMAND:
            return this._download(bucket, prefix, keys);
        case MENU_SHARE_COMMAND:
            return this._share(bucket, keys[0]);
        case MENU_NEW_MAPPING_COMMAND:
            dispatch(changeBosPath(bosPath));
            return dispatch({type: SYNCDISK_NEW_MAPPING});
        default:
            logger.warn(`invalid context command ${cmd.toString()}`);
        }
    }

    /**
     * 统一处理复制、重命名、迁移到等行为
     *
     *
     * @memberOf Explorer
     */
    _onMigration = (config = {}, removeSource = false) => {
        const {sourceBucket, sourceObject, targetBucket, targetObject} = config;

        this.setState({visible: false});

        if (sourceBucket !== targetBucket || sourceObject !== targetObject) {
            this.props.dispatch(
                migrationObject(config, removeSource)
            ).then(
                () => notification.success({
                    message: '操作成功',
                    description: `${sourceObject} => ${targetObject}`
                }),
                err => notification.error({
                    message: '操作异常',
                    description: `${sourceObject} => ${targetObject}, 原因：${err.message}`
                })
            );
        }
    }

    _onCancel = () => {
        this.setState({visible: false});
    }

    /**
     * 创建文件夹
     */
    _onCreateFolder = () => {
        const {form, props: {bucket, prefix, dispatch}} = this;

        form.validateFields(async (err, values) => {
            if (err) {
                return;
            }

            try {
                await dispatch(createFolder(bucket, prefix, values.name));
                notification.success({message: '创建成功', description: `成功创建文件夹${values.name}`});

                this.setState({newFolder: false});
                form.resetFields();
                this._onReresh();
            } catch (ex) {
                notification.error({message: '创建失败', description: ex.message});
            }
        });
    }

    _onCancelCreateFolder = () => {
        this.setState({newFolder: false});
    }

    /**
     * 统一处理下载行为
     *
     * @param {any} region
     * @param {any} bucketName
     * @param {any} prefix
     * @param {any} keys
     * @returns
     *
     * @memberOf Explorer
     */
    _download(bucketName, prefix, keys) {
        // 选择文件夹
        const selectPaths = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        // 用户取消了
        if (selectPaths === undefined) {
            return;
        }

        // 不支持选择多个文件夹，所以只取第一个
        const dirname = prefix.endsWith('/') ? prefix : path.posix.dirname(prefix);
        this.props.dispatch(
            createDownloadTask(bucketName, dirname, keys, selectPaths[0])
        );
    }

    /**
     * 刷新，右键菜单、菜单按钮统一在这里处理
     *
     * @memberOf Explorer
     */
    _onReresh() {
        const {bucket, prefix, dispatch} = this.props;

        dispatch(listObjects(bucket, prefix));
    }

    /**
     * 上传文件，鼠标右键、菜单按钮、拖放都在这里统一处理
     *
     * Note: On Windows and Linux an open dialog can not be both a file selector and a directory selector,
     * so if you set properties to ['openFile', 'openDirectory'] on these platforms, a directory selector will be shown.
     *
     * @param {Object} config
     * @returns
     *
     * @memberOf Explorer
     */
    _onUploadFile(config, selectAction = 'openFile') {
        const {bucket, prefix, dispatch} = this.props;
        const {transferItems} = config;

        if (transferItems) {
            return dispatch(uploadByDropFile(transferItems, {bucket, prefix}));
        }

        const properties = isOSX
            ? ['openFile', 'openDirectory', 'multiSelections']
            : [selectAction, 'multiSelections'];

        // 选择文件夹
        const selectPaths = remote.dialog.showOpenDialog({properties});
        // 用户取消了
        if (selectPaths === undefined) {
            return;
        }

        dispatch(uploadBySelectPaths(selectPaths, {bucket, prefix}));
    }

    /**
     * 分享文件
     *
     * @param {string} bucketName
     * @param {string} objectKey
     * @returns
     *
     * @memberOf Explorer
     */
    async _share(bucket, objectKey) {
        try {
            const client = await ClientFactory.fromBucket(bucket);
            const url = await client.generatePresignedUrl(bucket, objectKey);

            clipboard.writeText(url);

            message.info('已复制到剪切板');
        } catch (ex) {
            message.error('分享链接错误');
        }
    }

    /**
     * 确定操作
     */
    _onNewMapping() {
        const {dispatch, syncdisk} = this.props;
        const {localPath, bosPath, mappings} = syncdisk;
        if (bosPath && localPath) {
            if (u.find(mappings, item => item.localPath === localPath && item.bosPath === bosPath)) {
                return notification.error({message: '创建失败：已存在相同映射关系'});
            }
            const mapping = {localPath, bosPath, status: 'running', uuid: getUuid()};
            dispatch({type: SYNCDISK_CHANGE_NEWMAPPING, mapping});
            dispatch({type: SYNCDISK_CHANGE_SIGNAL, mapping});
            notification.success({message: '同步盘创建成功，可在左侧同步盘中管理任务'});
            return;
        }
        notification.error({message: '创建失败：参数填写错误'});
    }

    /**
     * 统一处理删除行为
     *
     * @param {any} bucketName
     * @param {any} prefix
     * @param {any} keys
     *
     * @memberOf Explorer
     */
    _trash(bucketName, prefix, keys) {
        const toast = keys.length > 1 ? ` ${keys.length} 个文件` : keys[0];

        const onOk = async () => {
            try {
                await this.props.dispatch(deleteObject(bucketName, prefix, keys));
                notification.success({message: '删除成功', description: `成功删除${toast}`});
            } catch (ex) {
                notification.error({message: '删除失败', description: ex.message});
            }

            this._onReresh();
        };

        Modal.confirm({title: '删除提示', content: `您确定删除${toast}?`, onOk});
    }

    updateValue(evt) {
        const target = evt.target.value;
        const {option} = this.state;

        option.target = target;

        this.setState({option});
    }

    renderWindow() {
        const {visible, option, newFolder} = this.state;
        const {region, bucket, prefix, dispatch} = this.props;

        if (!bucket) {
            return (
                <div className={styles.body}>
                    <SystemBar resize />
                    <Navigator />
                    <BucketWindow region={region} dispatch={dispatch} />
                </div>
            );
        }

        return (
            <div className={styles.body}>
                <SystemBar resize />
                <Navigator />
                <ObjectWindow
                    ref={_objectWindow => this._objectWindow = _objectWindow}
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
                <NewFolder
                    ref={this.saveFormRef}
                    visible={newFolder}
                    onConfirm={this._onCreateFolder}
                    onCancel={this._onCancelCreateFolder}
                />
                <NewMapping dispatch={dispatch} onConfirm={() => this._onNewMapping()} />
            </div>
        );
    }

    render() {
        return (
            <div className={styles.container}>
                <SideBar />
                {this.renderWindow()}
            </div>
        );
    }
}
