/**
 * Component - Version Component
 *
 * @file Version.js
 * @author mudio(job.mudio@gmail.com)
 */

import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';

import styles from './Version.css';
import BrowserLink from '../Common/BrowserLink';
import * as UpdaterActions from '../../actions/updater';

class Version extends Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
        lastest: PropTypes.shape({
            url: PropTypes.string,
            error: PropTypes.string,
            releaseName: PropTypes.string
        })
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
        case UpdaterActions.UPDATE_DOWNLOADED:
            return (
                <span className={styles.btn}>
                    <i className="fa fa-exclamation-triangle" />
                    {version}
                    <span className={styles.tip}>
                        新版本 {lastest.releaseName} 已经下载，重启客户端将自动安装更新
                    </span>
                </span>
            );
        case UpdaterActions.UPDATE_ERROR: {
            if (lastest.url) {
                return (
                    <span className={styles.btn}>
                        <i className="fa fa-exclamation-triangle" />
                        {version}
                        <span className={styles.tip}>
                            发现新版本
                            <BrowserLink linkTo={lastest.url}>
                                {lastest.releaseName}
                            </BrowserLink>
                            ，由于更新服务异常，请手动更新。
                        </span>
                    </span>
                );
            }

            return (
                <span className={styles.btn}>
                    <i className="fa fa-exclamation-triangle" />
                    {version}
                    <span className={styles.tip}>{lastest.error}</span>
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

    render() {
        return (
            <div className={styles.container}>
                {this.getVersionDom()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.update);
}

export default connect(mapStateToProps)(Version);
