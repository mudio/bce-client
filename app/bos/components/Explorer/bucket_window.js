/**
 * Component - BucketWindow Component
 *
 * @file BucketWindow.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React, {Component} from 'react';

import Bucket from './Bucket';
import styles from './bucket_window.css';
import {redirect} from '../../actions/navigator';

class BucketWindow extends Component {
    static propTypes = {
        region: PropTypes.string.isRequired,

        dispatch: PropTypes.func.isRequired,

        // 数据是否正在请求
        isFetching: PropTypes.bool.isRequired,
        // 是否出错
        hasError: PropTypes.bool.isRequired,
        // 错误信息
        error: PropTypes.string,
        // 数据是否全部返回
        isTruncated: PropTypes.bool.isRequired,
        // 下次请求起点，isTruncated为true时候有效
        nextMarker: PropTypes.string,
        // buckets集合，最多100个
        buckets: PropTypes.array.isRequired,
        // 文件夹集合, 这里存放多次请求的response
    };

    redirect = (bucket) => {
        const {dispatch} = this.props;
        dispatch(redirect({bucket}));
    }

    renderContents() {
        const {buckets, isFetching, hasError, error} = this.props;

        if (isFetching) {
            return (
                <span className={styles.loading}>
                    <i className="fa fa-spinner fa-pulse" />
                    数据加载中...
                </span>
            );
        }

        if (hasError) {
            return (
                <span className={styles.error}>
                    <i className="fa fa-mixcloud fa-lg" />
                    错误:{error}!
                </span>
            );
        }

        if (buckets.length === 0) {
            return (
                <span className={`fa fa-shopping-cart ${styles.nocontent}`}>
                    请创建Bucket.
                </span>
            );
        }

        return buckets.map((item, index) => (
            <Bucket key={index} item={item} onDoubleClick={this.redirect} />
        ));
    }

    render() {
        return (
            <div className={styles.container}>
                {this.renderContents()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.explorer;
}

export default connect(mapStateToProps)(BucketWindow);
