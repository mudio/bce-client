/**
 * Component - SyncDisk Component
 *
 * @file SyncDisk.js
 * @author helianthuswhite(hyz19960229@gmail.com)
 */

import u from 'underscore';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Table, Tooltip, Icon, notification, Modal} from 'antd';
import {connect} from 'react-redux';
import {shell} from 'electron';

import Header from './Header';
import NewTask from './NewMapping';
import styles from './SyncDisk.css';
import SideBar from '../app/SideBar';
import SystemBar from '../common/SystemBar';
import {
    toggleNewMapping,
    SYNCDISK_CHANGE_NEWMAPPING,
    SYNCDISK_CHANGE_DELETEMAPPING,
    SYNCDISK_CHANGE_SIGNAL,
    SYNCDISK_CHANGE_MAPPING
} from '../../actions/syncdisk';
import {redirect} from '../../actions/navigator';
import {getUuid} from '../../../utils/helper';
import {getLogPath} from '../../../utils';

class SyncDisk extends Component {
    state = {
        selectedRowKeys: [],
        selectedRows: [],
    };

    columns = [
        {
            title: '序号',
            dataIndex: 'key',
            width: 60
        },
        {
            title: '本地路径',
            dataIndex: 'localPath',
            render: path => (
                <Tooltip placement="top" title={path}>
                    <button type="button" className={styles.text} onClick={() => this.onOpenLocalPath(path)}>
                        {path}
                    </button>
                </Tooltip>
            )
        },
        {
            title: 'BOS路径',
            dataIndex: 'bosPath',
            render: path => (
                <Tooltip placement="top" title={path}>
                    <button type="button" className={styles.text} onClick={() => this.onOpenBosPath(path)}>
                        {path}
                    </button>
                </Tooltip>
            )
        },
        {
            title: '最后同步时间',
            dataIndex: 'syncTime',
            width: 150,
            render: time => time || '-'
        },
        {
            title: '操作',
            dataIndex: 'op',
            width: 150,
            render: (value, item) => {
                let tmpHtml = (
                    <button type="button" className={styles.cmd} onClick={() => this.onStartSync([item])}>
                        <Tooltip placement="top" title="开始"><Icon type="play-circle" /></Tooltip>
                    </button>
                );
                if (item.status === 'running') {
                    tmpHtml = (
                        <button type="button" className={styles.cmd} onClick={() => this.onPause([item])}>
                            <Tooltip placement="top" title="暂停"><Icon type="pause-circle" /></Tooltip>
                        </button>
                    );
                }
                return (
                    <span>
                        {tmpHtml}
                        <button type="button" className={styles.cmd} onClick={() => this.onViewLog([item])}>
                            <Tooltip placement="top" title="查看日志"><Icon type="eye" /></Tooltip>
                        </button>
                        <button type="button" className={styles.cmd} onClick={() => this.onDelete([item])}>
                            <Tooltip placement="top" title="删除"><Icon type="delete" /></Tooltip>
                        </button>
                    </span>
                );
            }
        },
    ];

    static propTypes = {
        localPath: PropTypes.string,
        bosPath: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
        mappings: PropTypes.array.isRequired,
        history: PropTypes.any.isRequired,
        visible: PropTypes.bool.isRequired
    };

    /**
     * 确定操作
     */
    onConfirm() {
        const {localPath, dispatch, bosPath, mappings} = this.props;
        if (bosPath && localPath) {
            if (u.find(mappings, item => item.localPath === localPath && item.bosPath === bosPath)) {
                return notification.error({message: '创建失败：已存在相同映射关系'});
            }
            const mapping = {localPath, bosPath, status: 'running', uuid: getUuid()};
            dispatch({type: SYNCDISK_CHANGE_NEWMAPPING, mapping});
            this.onStartSync([mapping]);
            return;
        }
        notification.error({message: '创建失败：参数填写错误'});
    }

    /**
     * 新建任务
     */
    onNewTask() {
        const {dispatch, visible} = this.props;
        dispatch(toggleNewMapping(visible));
    }

    /**
     * 开始同步
     * @param {*} items 同步参数
     */
    onStartSync(items) {
        const {dispatch, mappings} = this.props;
        u.each(items, item => {
            const target = u.find(mappings, m => m.uuid === item.uuid);
            const mapping = Object.assign({}, target, {status: 'running'});
            dispatch({type: SYNCDISK_CHANGE_MAPPING, mapping});
            dispatch({type: SYNCDISK_CHANGE_SIGNAL, mapping});
        });
    }

    /**
     * 查看日志
     * @param {*} items 所选文件
     */
    onViewLog(items) {
        shell.showItemInFolder(getLogPath(items[0].localPath));
        shell.openItem(getLogPath(items[0].localPath));
    }

    /**
     * 暂停同步
     * @param {*} items 同步参数
     */
    onPause(items) {
        const {dispatch, mappings} = this.props;
        u.each(items, item => {
            const target = u.find(mappings, m => m.uuid === item.uuid);
            const mapping = Object.assign({}, target, {status: 'paused'});
            dispatch({type: SYNCDISK_CHANGE_MAPPING, mapping});
            dispatch({type: SYNCDISK_CHANGE_SIGNAL, mapping});
        });
    }

    /**
     * 删除同步
     * @param {*} item 同步参数
     */
    onDelete(items) {
        Modal.confirm({
            title: '删除提示',
            content: (
                <div>
                    <p>删除同步映射不会删除BOS中已经同步的资源，如需删除已同步资源请至对应Bucket中进行操作。</p>
                    <p>请确认是否删除该同步映射？</p>
                </div>
            ),
            onOk: () => {
                const indexs = u.map(items, item => {
                    const mapping = Object.assign({}, item, {status: 'paused'});
                    this.props.dispatch({type: SYNCDISK_CHANGE_SIGNAL, mapping});
                    return item.key - 1;
                });
                this.props.dispatch({type: SYNCDISK_CHANGE_DELETEMAPPING, indexs});

                this.setState({selectedRowKeys: [], selectedRows: []});
            }
        });
    }

    /**
     * 打开本地文件夹
     * @param {*} path 路径
     */
    onOpenLocalPath(path) {
        shell.openItem(path);
    }

    /**
     * 跳转至BOS文件夹
     * @param {*} path 路径
     */
    onOpenBosPath(path) {
        const bucketName = path.split('/')[0];
        const prefix = path.substring(bucketName.length + 1);
        this.props.dispatch(redirect({bucket: bucketName, prefix}));
        this.props.history.push('/region');
    }

    /**
     * 渲染列表数据
     */
    renderList() {
        const {mappings} = this.props;
        const {selectedRowKeys} = this.state;
        const dataSource = mappings.map((item, key) => ({
            ...item,
            key: key + 1
        }));
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys, selectedRows})
            }
        };

        if (mappings.length) {
            return (
                <Table
                    rowSelection={rowSelection}
                    columns={this.columns}
                    dataSource={dataSource}
                    ellipsis
                    pagination={false}
                />
            );
        }
        return (
            <span className={`fa fa-cloud-upload ${styles.nocontent}`}>
                暂时没有同步任务，快去创建吧
            </span>
        );
    }

    render() {
        const {dispatch, mappings} = this.props;
        return (
            <div className={styles.container}>
                <SideBar />
                <div className={styles.body}>
                    <SystemBar resize />
                    <Header
                        dispatch={dispatch}
                        dataSource={mappings}
                        selectedItems={this.state.selectedRowKeys}
                        onNewTask={() => this.onNewTask()}
                        onDelete={() => this.onDelete(this.state.selectedRows)}
                        // onRefresh={() => this.onRefresh()}
                    />
                    <div className={styles.content}>
                        {this.renderList()}
                    </div>
                </div>
                <NewTask dispatch={dispatch} onConfirm={() => this.onConfirm()} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.syncdisk);
}

export default connect(mapStateToProps)(SyncDisk);
