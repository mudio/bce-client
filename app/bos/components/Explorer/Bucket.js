/**
 * Component - Bucket Component
 *
 * @file Bucket.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './Bucket.css';

export default class Bucket extends Component {
    static propTypes = {
        onDoubleClick: PropTypes.func.isRequired,
        item: PropTypes.shape({
            name: PropTypes.string.isRequired,
            location: PropTypes.string.isRequired,
            creationDate: PropTypes.string.isRequired
        })
    };

    render() {
        const {item, onDoubleClick} = this.props;

        return (
            <div className={styles.container}
                onDoubleClick={() => onDoubleClick(item.name)}
            >
                <i className={`${styles.bucketicon} asset-bucket`} />
                <span className={styles.text} alt={item.creationDate}>{item.name}</span>
            </div>
        );
    }
}
