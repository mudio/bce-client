/**
 * Component - Url Component
 *
 * @file Url.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import _ from 'lodash';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import React, {Component} from 'react';
import { Lifecycle } from 'react-router'
import {Button} from 'antd';

import {listBuckets} from '../../actions/window';
import styles from './Navigator.css';
import {redirect, query} from '../../actions/navigator';
import {ClientFactory} from '../../api/client';
import BucketCreate from './BucketCreate';

class Navigator extends Component {
    static propTypes = {
        bucket: PropTypes.string,
        prefix: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
    };

    mixins = [Lifecycle]

    state = {
        buckets: []
    }

    constructor(props, ...args) {
        super(props, ...args);

        this.state = {
            focus: false, value: '', history: []
        };

        this.invokeQuery = _.debounce(this._query, 300);
    }

    componentDidMount() {
        const {dispatch, bucket, prefix} = this.props;
        dispatch(query({bucket, prefix}));

        const client = ClientFactory.getDefault();
        // 获取buckets
        client.listBuckets().then(res => {
            const buckets = res.buckets.map(
                bucket => ({
                    label: bucket.name,
                    value: bucket.name,
                    isLeaf: false,
                    enableMultiAz: bucket.enableMultiAz
                })
            );

            this.setState({buckets});
        });
    }

    bucketCreated = () => {
        const {dispatch} = this.props;
        dispatch(listBuckets({forceUpdate: true}));
    }

    componentWillReceiveProps(nextProps) {
        const {bucket, prefix} = nextProps;
        if (bucket !== this.props.bucket || prefix !== this.props.prefix) {
            this.setState({value: '', focus: false});
        }
    }

    saveFormRef = form => {
        this.form = form;
    }

    _onChange = evt => {
        this.setState({value: evt.target.value});
        this.invokeQuery();
    }

    _onKeyDown = (event) => {
        const {key, target} = event;
        const {buckets} = this.state;
        const {bucket} = this.props;
        const inputBucket = target.value.trim();
        // 当前输入的bucket名称是否合法, bucket值为空代表全部文件目录下，否则不做bucket校验
        const isValidBucket = !bucket
            ? Array.isArray(buckets) && buckets.some(item => item.value === inputBucket)
            : true;

        if (key === 'Enter' && !bucket && inputBucket && isValidBucket) {
            event.preventDefault();

            this._redirect(inputBucket);
        }
    }

    _onBlur = () => {
        const {value} = this.state;

        if (!value.trim()) {
            this.setState({focus: false});
        }
    }

    _onFocus = () => {
        this.setState({focus: true});
    }

    _onSearch = () => {
        const {focus} = this.state;
        const {bucket, prefix} = this.props;

        if (focus) {
            this.setState({value: '', focus: false});
            this._redirect(bucket, prefix);
        } else {
            this.setState({focus: true});
        }
    }

    forward = () => {
        const {history} = this.state;

        if (history.length > 0) {
            const {bucket, prefix} = history.shift();

            this._redirect(bucket, prefix);
        }
    }

    backward = () => {
        const {bucket, prefix = ''} = this.props;
        const {history} = this.state;

        this.setState({history: [{bucket, prefix}, ...history]});

        let prefixs = prefix.split('/');
        if (prefixs.length >= 2) {
            prefixs = prefixs.slice(0, prefixs.length - 2);

            if (prefixs.length === 0) {
                return this._redirect(bucket);
            }

            return this._redirect(bucket, prefixs);
        }

        this._redirect();
    }

    _redirect = (bucketName, prefix = '', search) => {
        const {dispatch} = this.props;

        if (Array.isArray(prefix)) {
            prefix = prefix.join('/');
        }

        if (prefix && !prefix.endsWith('/')) {
            prefix += '/';
        }

        dispatch(redirect({bucket: bucketName, prefix, search}));
    }

    /**
     * 查询匹配
     *
     * @memberOf Navigator
     */
    async _query() {
        const {value} = this.state;
        const {dispatch, bucket, prefix = ''} = this.props;

        dispatch(query({bucket, prefix, search: value}));
    }

    renderSearch() {
        const {focus, value} = this.state;
        const {bucket, prefix = ''} = this.props;

        const searchStyle = classnames('fa', {
            'fa-search': !focus,
            'fa-times': focus
        }, styles.search);

        const dynamic = () => {
            if (focus) {
                const [sep, name] = prefix.split('/').reverse(); // eslint-disable-line
                return (
                    <div className={styles.searchLabel}>
                        在{name || bucket || '所有区域'}中搜索
                    </div>
                );
            }

            const prefixs = prefix.split('/');

            const folderDoms = prefixs.map((item, index) => {
                if (item) {
                    const targetObject = prefixs.slice(0, index + 1);
                    const prefixText = item.length > 8 ? item.slice(0, -4) : '';
                    const suffixText = item.length > 8 ? `${item.slice(-4)}/` : `${item}/`;
                    return (
                        <span key={index}
                            data-prefix={prefixText}
                            data-suffix={suffixText}
                            onClick={() => this._redirect(bucket, targetObject)}
                        />
                    );
                }
                return null;
            });

            const bucketDoms = bucket
                ? (<span data-prefix="" data-suffix={`${bucket}/`} onClick={() => this._redirect(bucket)} />)
                : null;

            return (
                <div ref="navigator" className={styles.searchNavigator}>
                    <span data-prefix="" data-suffix="全部文件/" onClick={() => this._redirect()} />
                    {bucketDoms}
                    {folderDoms}
                </div>
            );
        };

        return (
            <div className={styles.inputWarp}>
                {dynamic()}
                <input value={value}
                    onBlur={this._onBlur}
                    onFocus={this._onFocus}
                    onChange={this._onChange}
                    onKeyDown={this._onKeyDown}
                />
                <i onClick={this._onSearch} className={searchStyle} />
            </div>
        );
    }

    render() {
        const {bucket} = this.props;
        const {history} = this.state;

        const leftClassName = classnames(styles.navBtn, {
            [styles.disable]: !bucket}
        );
        const rightClassName = classnames(styles.navBtn, {
            [styles.disable]: history.length === 0
        });

        return (
            <div className={styles.container}>
                <div className={styles.navGroup}>
                    <span className={leftClassName} onClick={this.backward}>
                        <i className="fa fa-chevron-left fa-lg" />
                    </span>
                    <span className={rightClassName} onClick={this.forward}>
                        <i className="fa fa-chevron-right fa-lg" />
                    </span>
                </div>
                {
                    !bucket &&
                    (
                        <div className={styles.createBtn}>
                            <BucketCreate onSuccess={this.bucketCreated}/>
                        </div>
                    )
                }
                <div className={styles.url}>
                    {this.renderSearch()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.navigator);
}

export default connect(mapStateToProps)(Navigator);
