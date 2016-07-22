/**
 * Component - Login Component
 *
 * @file Login.js
 * @author mudio(job.mudio@gmail.com)
 */


import styles from './Login.css';
import {hashHistory} from 'react-router';
import {REGION_BJ} from '../utils/region';
import React, {Component, PropTypes} from 'react';

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
                                  defaultValue="ac07c3a9d1744137a9781d7e73b43674"
                                />
                            </div>
                            <div className={styles.sk}>
                                <input
                                  ref="sk"
                                  type="text"
                                  placeholder="请输入SK"
                                  defaultValue="ca9598b0a49a4eb181b71d45cf18a7e6"
                                />
                            </div>
                        </div>
                    }
                    <div className={styles.pin}>
                        <input type="text" placeholder="输入PIN码" ref="pin" />
                        {
                            isLoading === true ? <i className="fa fa-spinner fa-pulse fa-fw" />
                            : <input type="submit" className={styles.loginBtn} value="登录" />
                        }
                    </div>
                    {
                        ak && sk && isAuth === false
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
