/**
 * Component - Transfer Component
 *
 * @file Transfer.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import Header from './Header';
import styles from './Transfer.css';
import SideBar from '../App/SideBar';
import UploadItem from './UploadItem';
import DownloadItem from './DownloadItem';
import {TransCategory} from '../../utils/BosType';

export default class Transfer extends Component {
    static propTypes = {
        params: PropTypes.shape({
            transType: PropTypes.string.isRequired
        }),
        uploads: PropTypes.array.isRequired,
        downloads: PropTypes.array.isRequired,
        dispatch: PropTypes.func.isRequired
    };

    getCategoryContent() {
        const {uploads, downloads, dispatch} = this.props;
        const {transType} = this.props.params;

        if (transType === TransCategory.Upload) {
            return (
                <div className={styles.content}>
                    {
                        uploads.map(
                            item => (
                                <UploadItem key={item.uuid} {...item} dispatch={dispatch} />
                            )
                        )
                    }
                    {
                        uploads.length === 0
                        && <span className={`fa fa-cloud-upload ${styles.nocontent}`}>没有上传任务~(&gt;_&lt;)!!!</span>
                    }
                </div>
            );
        } else if (transType === TransCategory.Download) {
            return (
                <div className={styles.content}>
                    {
                        downloads.map(item => (
                            <DownloadItem key={item.uuid} {...item} dispatch={dispatch} />
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

    render() {
        const {dispatch, params} = this.props;

        return (
            <div className={styles.container}>
                <SideBar />
                <div className={styles.body}>
                    <Header dispatch={dispatch} transType={params.transType} />
                    {this.getCategoryContent()}
                </div>
            </div>
        );
    }
}
