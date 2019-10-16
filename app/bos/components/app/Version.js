/**
 * Component - Version Component
 *
 * @file Version.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ipcRenderer} from 'electron';
import React, {Component} from 'react';
import {Button, Icon, notification} from 'antd';

import styles from './Version.css';
import BrowserLink from '../common/BrowserLink';
import * as UpdaterActions from '../../actions/updater';

class Version extends Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
        lastest: PropTypes.string
    }

    componentDidUpdate() {
        const {type, lastest} = this.props;

        if (type === UpdaterActions.UPDATE_DOWNLOADED) {
            notification.open({
                key: this.notifyKey,
                btn: (
                    <Button type="primary" size="small" onClick={this.installUpdate}>
                        现在重启
                    </Button>
                ),
                icon: (
                    <Icon type="smile-circle" style={{color: '#108ee9'}} />
                ),
                duration: 0,
                message: '发现新版本',
                description: `新版本 ${lastest} 已经下载，重启客户端将自动安装更新`
            });
        }
    }

    get notifyKey() {
        return `update_notify_${Date.now}`;
    }

    getVersionDom() {
        const {type, version, lastest} = this.props;

        switch (type) {
        case UpdaterActions.UPDATE_AVAILABLE:
            return (
                <span className={styles.btn}>
                    <i className="fa fa-spinner fa-pulse" />
                    {version}
                    <span className={styles.tip}>发现新的更新</span>
                </span>
            );
        case UpdaterActions.UPDATE_CHECKING:
            return (
                <span className={styles.btn}>
                    <i className="fa fa-spinner fa-pulse" />
                    {version}
                    <span className={styles.tip}>正在检查更新</span>
                </span>
            );
        case UpdaterActions.UPDATE_NOT_AVAILABLE:
            return (
                <span className={styles.btn}>
                    <i className="fa fa-map-signs" />
                    {version}
                    <span className={styles.tip}>当前最新版本</span>
                </span>
            );
        case UpdaterActions.UPDATE_DOWNLOADED: {
            return (
                <span className={styles.btn}>
                    <i className="fa fa-exclamation-triangle" />
                    {version}
                    <span className={styles.tip}>
                        新版本 {lastest} 已经下载，重启客户端将自动安装更新
                    </span>
                </span>
            );
        }
        case UpdaterActions.UPDATE_ERROR: {
            return (
                <span className={styles.btn}>
                    <i className="fa fa-exclamation-triangle" />
                    {version}
                    <span className={styles.tip}>
                        发现新版本
                        <BrowserLink linkTo="https://cloud.baidu.com/doc/BOS/s/Cjwvyqico">
                            {lastest}
                        </BrowserLink>
                        ，由于更新服务异常，请手动更新。
                    </span>
                </span>
            );
        }
        default:
            return (
                <span className={styles.btn}>
                    <i className="fa fa-map-signs" />
                    {version}
                </span>
            );
        }
    }

    installUpdate = () => {
        ipcRenderer.send('notify', UpdaterActions.UPDATE_COMMAND_INSTALL);
        notification.close(this.notifyKey);
    }

    render() {
        return (
            <div className={styles.container}>
                {this.getVersionDom()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.updater);
}

export default connect(mapStateToProps)(Version);

window.ipcRenderer = ipcRenderer;
