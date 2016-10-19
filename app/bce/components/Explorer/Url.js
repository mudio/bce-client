/**
 * Component - Url Component
 *
 * @file Url.js
 * @author mudio(job.mudio@gmail.com)
 */

import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './Url.css';

export default class Url extends Component {
    static propTypes = {
        nav: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string,
            folder: PropTypes.string
        }),
        updateNavigator: PropTypes.func.isRequired
    };

    constructor(...args) {
        super(...args);

        this.state = {history: []};
    }

    forward() {
        const {updateNavigator} = this.props;
        const nav = this.state.history.pop();

        if (nav) {
            updateNavigator(nav);
        }
    }

    backward() {
        const {nav, updateNavigator} = this.props;
        let {bucket, folder} = nav;

        if (!bucket) {
            return;
        }

        this.state.history.push({region: nav.region, bucket, folder});
        if (!folder) {
            bucket = '';
        } else {
            const paths = folder.split('/');
            paths.splice(-2, 1);
            folder = paths.join('/');
        }

        updateNavigator({region: nav.region, bucket, folder});
    }

    render() {
        const {nav} = this.props;
        const {history} = this.state;

        return (
            <div className={styles.container}>
                <div className={styles.nav}>
                    <span
                      className={
                        classnames({[styles.disable]: !nav.bucket})
                      }
                      onClick={() => this.backward()}
                    >
                    &lt;
                    </span>
                    <span
                      className={
                          classnames({[styles.disable]: history.length === 0})
                      }
                      onClick={() => this.forward()}
                    >
                    &gt;
                    </span>
                </div>
                <div className={styles.url}>
                    {nav.region}://
                    {nav.bucket && `${nav.bucket}/`}
                    {nav.folder}
                </div>
            </div>
        );
    }
}

