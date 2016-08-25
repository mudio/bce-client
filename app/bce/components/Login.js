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
import {REGION_BJ} from '../utils/Region';
import GlobalConfig from '../../main/ConfigManager';

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
        login: PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args);

        this.state = {innerError: ''};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuth) {
            hashHistory.push(`/region/${REGION_BJ}`);
        }
    }

    handleSubmit(evt) {
        evt.preventDefault();

        const {login, auth} = this.props;
        const pin = this.refs.pin.value.trim();
        if (auth.isAuth && auth.pin) {
            if (pin === auth.pin) {
                this.setState({innerError: ''});
                return hashHistory.push(`/region/${REGION_BJ}`);
            }
            return this.setState({innerError: 'PIN码验证失败! 使用AK/SK验证？'});
        }

        const ak = this.refs.ak.value.trim();
        const sk = this.refs.sk.value.trim();
        if (ak && sk) {
            return login(ak, sk, pin);
        }

        this.setState({innerError: '请输入AK、SK、PIN'});
    }

    render() {
        const {isLoading = false, ak, sk, pin, isAuth, error} = this.props.auth;

        return (
            <div className={styles.container}>
                <form className={styles.login} onSubmit={evt => this.handleSubmit(evt)}>
                    <h1>百度开放云</h1>
                    {
                        (!isAuth || !pin)
                        && <div>
                            <div className={styles.ak}>
                                <input
                                  ref="ak"
                                  type="text"
                                  placeholder="请输入AK"
                                  defaultValue={credentials.ak}
                                />
                            </div>
                            <div className={styles.sk}>
                                <input
                                  ref="sk"
                                  type="text"
                                  placeholder="请输入SK"
                                  defaultValue={credentials.sk}
                                />
                            </div>
                        </div>
                    }
                    <div className={styles.pin}>
                        <input type="text" placeholder="输入PIN码" ref="pin" />
                        {
                            isLoading === true ? <i className={`${styles.loading} fa fa-spinner fa-pulse fa-fw`} />
                            : <input type="submit" className={styles.loginBtn} value="登录" />
                        }
                    </div>
                    {
                        ak && sk && isAuth === false && error
                        && <span className={styles.error}>登录失败:{error}</span>
                    }
                    {
                        this.state.innerError
                        && <span className={styles.error}>{this.state.innerError}</span>
                    }
                </form>
            </div>
        );
    }
}
