/**
 * Component - Login Component
 *
 * @file Login.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0 */

import {hashHistory} from 'react-router';
import React, {Component, PropTypes} from 'react';

import styles from './Login.css';
import SystemBar from './Common/SystemBar';
import GlobalConfig from '../../main/ConfigManager';

const VALID_AUTH = 'VALID_AUTH';
const INVALID_PIN = 'INVALID_PIN';
const INVALID_AK_SK = 'INVALID_AK_SK';
const credentials = Object.assign({}, GlobalConfig.get('credentials'));

export default class Login extends Component {
    static propTypes = {
        auth: PropTypes.shape({
            isLoading: PropTypes.bool.isRequired,
            isAuth: PropTypes.bool.isRequired,
            error: PropTypes.string,
            ak: PropTypes.string,
            sk: PropTypes.string,
            pin: PropTypes.string
        }),
        login: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args);

        this.state = {innerErrorType: VALID_AUTH};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuth && !this.props.auth.isAuth) {
            hashHistory.push('/region');
        }
    }

    getLoginRender() {
        const {isLoading = false} = this.props.auth;
        if (isLoading) {
            return <i className={`${styles.loading} fa fa-spin`} />;
        }
        return <button className={`${styles.loginBtn} fa fa-arrow-circle-right`} />;
    }

    getLoginError() {
        const {ak, sk, isAuth, error} = this.props.auth;
        if (ak && sk && isAuth === false && error) {
            return <span className={styles.error}>登录失败:{error}</span>;
        }
    }

    getValidError() {
        const {innerErrorType} = this.state;

        if (innerErrorType === VALID_AUTH) {
            return '';
        } else if (innerErrorType === INVALID_AK_SK) {
            return (
                <span className={styles.error}>请输入AK、SK!</span>
            );
        } else if (innerErrorType === INVALID_PIN) {
            return (
                <span className={styles.error} >
                    PIN码验证失败!
                </span>
            );
        }
    }

    getAkSkFields() {
        const {pin, isAuth, ak} = this.props.auth;

        if (!pin || !isAuth) {
            return (
                <div>
                    <div className={styles.ak} data-tip="请输入AK">
                        <input
                            ref="ak"
                            type="text"
                            placeholder="请输入AK"
                            defaultValue={credentials.ak}
                        />
                    </div>
                    <div className={styles.sk} data-tip="请输入SK">
                        <input
                            ref="sk"
                            type="text"
                            placeholder="请输入SK"
                            defaultValue={credentials.sk}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.forgot}>
                <i className={'fa fa-user-secret fa-fw'} />
                <span>{ak.replace(/^([\w]{8})[\w]+([\w]{8}$)/g, '$1****************$2')}</span>
                <span className={`${styles.forgotBtn} fa fa-user-times fa-fw`}
                    onClick={() => this.forgotPin()}
                    data-tip="注销登录，使用AK/SK登录！"
                    tabIndex="-1"
                />
            </div>
        );
    }

    handleSubmit(evt) {
        evt.preventDefault();

        const {login, auth} = this.props;
        const pin = this.refs.pin.value.trim();
        if (auth.isAuth && auth.pin) {
            if (pin === auth.pin) {
                return hashHistory.push('/region');
            }
            return this.setState({innerErrorType: INVALID_PIN});
        }

        const ak = this.refs.ak.value.trim();
        const sk = this.refs.sk.value.trim();
        if (ak && sk) {
            return login(ak, sk, pin);
        }

        this.setState({innerErrorType: INVALID_AK_SK});
    }

    forgotPin() {
        const {logout} = this.props;
        this.refs.pin.value = '';
        this.setState({innerErrorType: VALID_AUTH});
        logout();
    }

    render() {
        return (
            <div className={styles.container}>
                <SystemBar darwinHidden />
                <form className={styles.login} onSubmit={evt => this.handleSubmit(evt)}>
                    <h1>百度云</h1>
                    {this.getAkSkFields()}
                    <div className={styles.pin}
                        data-tip="输入PIN码后，系统将记住你的AK、SK，下次登录只需要输入PIN码即可。"
                        data-tip-align="bottom"
                    >
                        <input type="text" placeholder="输入PIN码" ref="pin" />
                        {this.getLoginRender()}
                    </div>
                    {this.getLoginError()}
                    {this.getValidError()}
                </form>
            </div>
        );
    }
}
