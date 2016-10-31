/**
 * Component - Transfer Component
 *
 * @file Transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import Header from './Header';
import styles from './Transfer.css';
import UploadItem from './UploadItem';
import DownloadItem from './DownloadItem';
import SideBar from '../App/SideBar';
import {TransUploadType, TransDownloadType} from '../../utils/BosType';

export default class Transfer extends Component {
    static propTypes = {
        params: PropTypes.shape({
            transType: PropTypes.string.isRequired
        }),
        uploads: PropTypes.array.isRequired,
        downloads: PropTypes.array.isRequired,
        clearFinish: PropTypes.func.isRequired
    };

    getCategoryContent() {
        const {uploads, downloads} = this.props;
        const {transType} = this.props.params;

        if (transType === TransUploadType) {
            return (
                <div className={styles.content}>
                    {
                        uploads.map(
                            item => (<UploadItem key={item.object} {...item} />)
                        )
                    }
                    {
                        uploads.length === 0
                        && <span className={`fa fa-cloud-upload ${styles.nocontent}`}>没有上传任务~(&gt;_&lt;)!!!</span>
                    }
                </div>
            );
        } else if (transType === TransDownloadType) {
            return (
                <div className={styles.content}>
                    {
                        downloads.map(item => (
                            <DownloadItem key={item.path} {...item} />
                        ))
                    }
                    {
                        downloads.length === 0
                        && <span className={`fa fa-cloud-download ${styles.nocontent}`}>没有下载任务~(&gt;_&lt;)!!!</span>
                    }
                </div>
            );
        }
    }

    clearFinish() {
        const {clearFinish} = this.props;
        const {transType} = this.props.params;

        return clearFinish(transType);
    }

    createTask() {
    }

    render() {
        return (
            <div className={styles.container}>
                <SideBar />
                <div className={styles.body}>
                    <Header createTask={evt => this.createTask(evt)}
                        clearFinish={evt => this.clearFinish(evt)}
                    />
                    {this.getCategoryContent()}
                </div>
            </div>
        );
    }
}
