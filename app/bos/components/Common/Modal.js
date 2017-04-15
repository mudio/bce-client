/**
 * Component - Modal Dialog Component
 *
 * @file Modal.js
 * @author mudio(job.mudio@gmail.com)
 */

import classnames from 'classnames';
import React, {Component} from 'react';

import styles from './Modal.css';

export default class Modal extends Component {
    constructor(...args) {
        super(...args);
        this.state = {show: false, pending: false};
    }

    props: {
        width: String,
        children: HTMLElement,
        title: String.isRequired
    };

    show() {
        this.setState({show: true});
    }

    hide() {
        if (!this.state.pending) {
            this.setState({show: false});
        }
    }

    render() {
        const {width, title} = this.props;
        const stateStyle = this.state.show ? styles.show : styles.hide;

        return (
            <div className={classnames(styles.container, stateStyle)} >
                <div className={styles.mask} onClick={() => this.hide()} />
                <div className={styles.confirm} style={{width: `${width}px`}}>
                    <div className={styles.title} >{title}</div>
                    {this.props.children}
                    <div className={styles.footer} >
                        <span className={styles.ok} >确定</span>
                        <span className={styles.cancel} >取消</span>
                    </div>
                </div>
            </div>
        );
    }
}
