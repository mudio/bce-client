/**
 * Component - Login Component
 *
 * @file Login.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0, max-len: 0 */

import classnames from 'classnames';
import PropTypes from 'prop-types';
import {ipcRenderer} from 'electron';
import React, {Component} from 'react';

import styles from './Login.css';
import Button from './common/Button';
import SystemBar from './common/SystemBar';
import BrowserLink from './common/BrowserLink';
import GlobalConfig from '../../main/ConfigManager';

const credentials = GlobalConfig.get('credentials') || {ak: '', sk: ''};
const akskHelpLink = 'https://cloud.baidu.com/doc/Reference/GetAKSK.html#.E5.A6.82.E4.BD.95.E8.8E.B7.E5.8F.96AK.20.2F.20SK';

export default class Login extends Component {
    static propTypes = {
        pin: PropTypes.string,
        loading: PropTypes.bool,
        ak: PropTypes.string,
        sk: PropTypes.string,
        setPinCode: PropTypes.func.isRequired,
        login: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args);

        this.state = {
            ak: credentials.ak,
            sk: credentials.sk,
            pin: '',
            pinconfirm: '',
            errMsg: null,
            hasLogin: false,
        };
    }

    /**
     * 设置安全码
     *
     * @memberof Login
     */
    setPinCode = () => {
        const {pin, pinconfirm} = this.state;

        this.setState({errMsg: null});
        // 为了动画效果
        setImmediate(() => {
            if (!pin) {
                this.setState({errMsg: '请输入安全码'});
                return;
            }

            if (pin === pinconfirm) {
                this.props.setPinCode(pin);
                ipcRenderer.send('notify', 'login_success');
            } else {
                this.setState({errMsg: '安全码输入不一致'});
            }
        });
    }

    /**
     * 展示提示信息
     *
     * @returns
     * @memberof Login
     */
    showTipMessage() {
        const msg = this.state.errMsg;

        if (msg && msg.info) {
            return (
                <div className={styles.tip}>
                    <span className={classnames(styles.text, styles.info)}>
                        {msg.info}
                    </span>
                </div>
            );
        }

        if (msg) {
            return (
                <div className={styles.tip}>
                    <span className={styles.text}>{msg}</span>
                </div>
            );
        }

        return (<div className={styles.tip} />);
    }

    /**
     * 效验AK/SK
     *
     * @memberof Login
     */
    validateAkSK = async evt => {
        evt.preventDefault();

        const {ak, sk} = this.state;
        if (!ak || !sk) {
            this.setState({errMsg: 'AK/SK 格式错误'});
            return;
        }

        try {
            this.setState({errMsg: ''});
            await this.props.login(ak, sk);
            this.setState({
                hasLogin: true,
                errMsg: {info: '您可以设置安全码以便于以后快速登录'}
            });
        } catch ({code}) {
            let errMsg = '';

            switch (code) {
            case 'ENOTFOUND':
            case 'ETIMEDOUT': {
                errMsg = '网络连接超时';
                break;
            }
            case 'OptInRequired': {
                errMsg = '请先开通BOS服务';
                break;
            }
            case 'AccessDenied': {
                errMsg = '系统拒绝访问';
                break;
            }
            case 'AccountOverdue': {
                errMsg = '用户已欠费';
                break;
            }
            default: {
                errMsg = 'AK、SK效验错误';
            }
            }

            this.setState({errMsg});
        }
    }

    /**
     * 效验安全码
     *
     * @memberof Login
     */
    validatePinCode = () => {
        if (this.state.pin === this.props.pin) {
            ipcRenderer.send('notify', 'login_success');
        } else {
            this.setState({errMsg: '安全码错误'});
        }
    }

    /**
     * 清除安全码
     *
     * @memberof Login
     */
    clearAkSk = () => {
        this.props.logout();
    }

    /**
     * 跳过设置安全码
     *
     * @memberof Login
     */
    skipPinCodeCheck = () => {
        if (this.state.hasLogin) {
            ipcRenderer.send('notify', 'login_success');
        }
    }

    handleInputChange = evt => {
        const {name, value} = evt.target;
        this.setState({[name]: value.trim()});
    }

    /**
     * 设置验证安全码表单
     *
     * @returns
     * @memberof Login
     */
    renderValidatePinFields() {
        const accessKey = this.props.ak.replace(/^([\w]{8})[\w]+([\w]{8}$)/g, '$1****************$2');

        return (
            <form className={styles.loginform} onSubmit={this.validatePinCode}>
                <div className={styles.accesskey}>
                    <span>AK: {accessKey}</span>
                    <span className={styles.forgotBtn} onClick={this.clearAkSk}>更换</span>
                </div>
                <input type="password"
                    name="pin"
                    value={this.state.pin}
                    placeholder="请输入安全码"
                    onChange={this.handleInputChange}
                />
                <Button data-tip="验证安全码" className={styles.loginBtn} />
                <span className={styles.helplink} onClick={this.clearAkSk}>
                    忘记安全码
                </span>
            </form>
        );
    }

    /**
     * 绘制设置安全码表单
     *
     * @returns
     * @memberof Login
     */
    renderSetPinFields() {
        return (
            <form className={styles.loginform} onSubmit={this.setPinCode}>
                <input type="password"
                    name="pin"
                    value={this.state.pin}
                    onChange={this.handleInputChange}
                    placeholder="请输入安全码"
                />
                <input type="password"
                    name="pinconfirm"
                    value={this.state.pinconfirm}
                    onChange={this.handleInputChange}
                    placeholder="请再次输入安全码"
                />
                <Button data-tip="设置安全码" className={styles.loginBtn} />
                <span className={styles.helplink} onClick={this.skipPinCodeCheck}>
                    跳过设置
                </span>
            </form>
        );
    }

    /**
     * 绘制AK\SK表单
     *
     * @returns
     * @memberof Login
     */
    renderAkSkFields() {
        const {loading} = this.props;

        function loadingOrLogin() {
            if (loading) {
                return (<i className={`${styles.loading} fa fa-spinner fa-spin`} />);
            }

            return (<Button className={styles.loginBtn} data-tip="登录" />);
        }

        return (
            <form className={styles.loginform} onSubmit={this.validateAkSK}>
                <input type="text"
                    name="ak"
                    value={this.state.ak}
                    onChange={this.handleInputChange}
                    placeholder="Access Key ID (AK)"
                />
                <input type="text"
                    name="sk"
                    value={this.state.sk}
                    onChange={this.handleInputChange}
                    placeholder="Secret Access Key (SK)"
                />
                {loadingOrLogin()}
                <BrowserLink className={styles.helplink} linkTo={akskHelpLink}>
                    如何获取AK/SK?
                </BrowserLink >
            </form>
        );
    }

    /**
     * 登陆分为几个状态：`验证AK/SK`、`设置安全码`、`验证安全码`
     *
     * @returns
     * @memberof Login
     */
    render() {
        // 已经登录了，如果没有pin则提示
        const showSetPinCode = this.state.hasLogin && !this.props.pin;
        // 没有登录，如果有pin则也提示
        const showValidatePinCode = !this.state.hasLogin && this.props.pin;

        const switchShow = () => {
            if (showValidatePinCode) {
                return this.renderValidatePinFields();
            }

            if (showSetPinCode) {
                return this.renderSetPinFields();
            }

            if (!showValidatePinCode && !showSetPinCode) {
                return this.renderAkSkFields();
            }

            return null;
        };

        return (
            <div className={styles.container}>
                <SystemBar />
                <svg className={styles.logo} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
                    <g fill="#2eacfc">
                        <path d="M50.597,59.606V42.301c0-3.35-1.814-6.448-4.76-8.121l-12.029-6.842v41.819c0,1.048,0.568,2.017,1.489,2.539
                            l36.906,20.996V79.007c0-3.35-1.814-6.447-4.758-8.124l-15.361-8.737C51.162,61.621,50.597,60.656,50.597,59.606"
                        />
                        <path d="M97.919,62.144l-15.362,8.737c-2.944,1.678-4.758,4.774-4.758,8.124v13.687l36.904-20.997
                            c0.921-0.521,1.488-1.49,1.488-2.539V27.337l-12.027,6.842c-2.946,1.673-4.762,4.769-4.762,8.121v17.306
                            C99.402,60.654,98.837,61.62,97.919,62.144"
                        />
                        <path d="M92.621,10.162L77.209,1.393c-0.92-0.523-2.054-0.523-2.975,0L37.177,22.475l12.028,6.844
                            c2.947,1.673,6.575,1.673,9.516,0l15.513-8.828c0.219-0.123,0.447-0.211,0.684-0.278c0.762-0.208,1.587-0.12,2.291,0.278
                            l15.511,8.828c2.943,1.673,6.571,1.673,9.515,0l12.032-6.844L92.621,10.162z"
                        />
                        <path d="M9.979,109.752h40.606v5.691H35.357l-0.875,3.62h14.353v24.836c0.234,3.453-1.693,5.117-5.776,5.003H11.905
                            v-29.839h14.176l0.696-3.62H9.979V109.752z M18.731,130.966h23.276v-6.727H18.731V130.966z M42.008,141.828v-5H18.731v6.725h21.529
                            C41.54,143.789,42.124,143.211,42.008,141.828"
                        />
                        <path d="M72.64,110.788v-1.725h6.474v1.725h16.103v4.826H62.838v28.633v4.311h-5.603v-5.173v-32.597H72.64z
                            M64.588,136.313v-4.314h30.279v3.967l-10.677,6.551l1.048,0.521c0.702,0.462,1.517,0.632,2.452,0.516h7.354v4.832h-9.452
                            c-1.289,0-2.452-0.233-3.504-0.689l-3.85-1.897l-3.33,1.725c-1.282,0.575-2.679,0.917-4.195,1.035h-7.176v-5.005h5.077
                            c1.164,0,1.98-0.113,2.449-0.342l1.926-0.862l-8.228-5.864L64.588,136.313z M66.338,123.203h-2.102v-4.832h1.926v-1.895h5.776v1.728
                            h15.576v-1.554h5.78v1.554h1.922v4.828h-1.922v4.138c-0.241,2.303-1.696,3.452-4.379,3.452H66.338V123.203z M72.114,123.032v3.967
                            h13.478c1.396,0.231,2.099-0.113,2.099-1.038v-2.929H72.114z M72.64,136.313l2.625,1.551l2.798,1.554l5.077-3.104H72.64z"
                        />
                        <path d="M140.021,116.135h-39.206v-5.521h39.206V116.135z M100.815,144.762l5.952-15.176h-5.952v-5.518h39.206v5.518
                            h-26.955l-5.25,13.625h25.204c0.465,0.113,0.7-0.113,0.7-0.691v-6.383h6.127v8.281c0,2.757-1.342,4.14-4.026,4.14h-35.006V144.762z"
                        />
                    </g>
                </svg>
                {this.showTipMessage()}
                {switchShow()}
            </div>
        );
    }
}
