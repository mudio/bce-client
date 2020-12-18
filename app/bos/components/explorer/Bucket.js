/**
 * Component - Bucket Component
 *
 * @file Bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Tooltip} from 'antd';

import styles from './Bucket.css';

export default class Bucket extends Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        item: PropTypes.shape({
            name: PropTypes.string.isRequired,
            location: PropTypes.string.isRequired,
            creationDate: PropTypes.string.isRequired
        })
    };

    _triggerClick = () => {
        const {item, onClick} = this.props;
        onClick(item.name);
    }

    render() {
        const {item} = this.props;

        return (
            <div className={styles.container} onClick={this._triggerClick}>
                <i className={`${styles.bucketicon} asset-bucket`} />
                <Tooltip placement="bottom" title={item.name}>
                    <span className={styles.text} alt={item.creationDate}>{item.name}</span>
                </Tooltip>
            </div>
        );
    }
}
