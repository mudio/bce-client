/**
 * Component - NewTask Component
 *
 * @file NewTask.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import u from 'underscore';
import {remote} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Modal, Button, Select, Form, Tooltip, Alert, notification} from 'antd';

import styles from './NewMapping.css';
import {ClientFactory} from '../../api/client';
import {toggleNewMapping, changeLocalPath, changeBosPath} from '../../actions/syncdisk';
import ErrorCode from '../../utils/ErrorCode';

const FormItem = Form.Item;

class NewMapping extends Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        dispatch: PropTypes.func.isRequired,
        bosPath: PropTypes.string.isRequired,
        localPath: PropTypes.string.isRequired,
        onConfirm: PropTypes.func.isRequired
    };

    state = {
        buckets: [],
        datasource: [],
        bucketName: '',
        open: false,
        loading: false,
        objects: []
    };

    componentWillReceiveProps(nextProps) {
        // 获取buckets
        if (nextProps.visible && !this.state.buckets.length) {
            this._getBuckets();
        }
    }

    /**
     * 取消关闭弹窗
     */
    _onCancel() {
        const {dispatch, visible} = this.props;
        dispatch(toggleNewMapping(visible));
    }

    /**
     * 选择本地文件夹
     */
    _onChooseLocal() {
        const {dispatch} = this.props;
        // 选择文件夹
        const selectPaths = remote.dialog.showOpenDialog({properties: ['openDirectory']});
        // 用户取消了
        if (selectPaths === undefined) {
            return;
        }
        //  目前只支持单选文件夹
        dispatch(changeLocalPath(selectPaths[0]));
    }

    /**
     * 渲染options
     */
    _renderOptions() {
        const {datasource} = this.state;
        let backHtml = null;
        if (!datasource[0] || datasource[0].value.split('/')[1]) {
            backHtml = (
                <div
                    className={styles.option}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => this._onBackLast()}
                >
                返回上级
                </div>
            );
        }
        return (
            <ul className={styles.optionWrapper}>
                {backHtml}
                {
                    u.map(datasource, item => (
                        <div
                            className={styles.option}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => this._onSelect(item.value)}
                            key={item.value}
                        >
                            {item.text}
                        </div>
                    ))
                }
            </ul>
        );
    }

    /**
     * 返回上级
     */
    _onBackLast() {
        const value = this.props.bosPath;
        const splits = value.split('/');
        splits.splice(splits.length - 2, 1);
        const prefix = splits.join('/');
        this._onSelect(prefix);
    }

    /**
     * 获取bucket列表
     */
    async _getBuckets() {
        const client = ClientFactory.getDefault();
        const res = await client.listBuckets();
        const buckets = u
            .chain(res.buckets)
            .map(bucket => bucket.name)
            .compact()
            .value();
        const datasource = u.map(buckets, name => ({text: `${name}/`, value: `${name}/`}));
        this.setState({buckets, datasource});
    }

    /**
     * 获取objects
     * @param {*} bucketName bucket名称
     */
    async _getObjects(bucketName) {
        this.setState({loading: true});
        let objects = [];
        try {
            const client = await ClientFactory.fromBucket(bucketName);
            const rawObjects = await client.listAllObjects(bucketName);
            objects = u.map(rawObjects, item => {
                item.key = `${bucketName}/${item.key}`;
                return item;
            });
        } catch (error) {
            ErrorCode[error.code]
                ? notification.error({message: ErrorCode[error.code]})
                : notification.error({message: error.code, description: error.message});
        }
        this.setState({objects, bucketName, loading: false});
        return objects;
    }

    /**
     * 选中时操作
     * @param {*} prefix value
     */
    async _onSelect(prefix) {
        this.props.dispatch(changeBosPath(prefix));

        const bucketName = prefix.split('/')[0];
        let {objects} = this.state;

        //  如果bucketName不存在重新获取
        if (!bucketName) {
            return this._getBuckets();
        }

        if (!objects.length || bucketName !== this.state.bucketName) {
            objects = await this._getObjects(bucketName);
        }
        const folders = u.chain(objects)
            .map(item => {
                const lastfix = item.key.split(prefix)[1] || '';
                return lastfix.indexOf('/') > -1 ? lastfix.split('/')[0] : null;
            })
            .compact()
            .uniq()
            .value();

        const datasource = u.map(folders, item => ({text: item, value: `${prefix}${item}/`}));
        if (datasource.length) {
            this.setState({datasource});
        } else {
            this.setState({datasource: [], open: false});
        }
    }

    render() {
        const {visible, localPath, bosPath, onConfirm} = this.props;
        const {loading, open} = this.state;
        const message = '同步映射建立完成后将自动开始数据同步，您可以在列表中使用操作来暂停自动同步';

        return (
            <Modal title="新建同步映射关系"
                width={520}
                visible={visible}
                maskClosable={false}
                onCancel={() => this._onCancel()}
                onOk={onConfirm}
            >
                <Form layout="inline" labelAlign="left" className="bce-form">
                    <FormItem>
                        <Alert message={message} type="info" showIcon />
                    </FormItem>
                    <FormItem label="本地文件目录" required>
                        <Button type="primary" onClick={() => this._onChooseLocal()}>选择本地文件目录</Button>
                        <Tooltip placement="top" title={localPath} overlayClassName={styles.tooltip}>
                            <span className={styles.path}>{localPath}</span>
                        </Tooltip>
                    </FormItem>
                    <FormItem label="BOS文件目录" required>
                        <Select
                            type="primary"
                            loading={loading}
                            style={{width: '330px'}}
                            open={open}
                            value={bosPath}
                            onDropdownVisibleChange={value => this.setState({open: value})}
                            dropdownRender={() => this._renderOptions()}
                        />
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.syncdisk);
}

export default connect(mapStateToProps)(NewMapping);
