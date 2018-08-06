/**
 * Component - Svg Button Component
 *
 * @file Button.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable max-len */

import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './Button.css';

export default class BrowserLink extends Component {
    static propTypes = {
        className: PropTypes.string
    }

    render() {
        const {className, ...props} = this.props;

        return (
            <button type="button" data-tip-align="left" {...props} className={classnames(className, styles.container)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px">
                    <g>
                        <circle strokeWidth="2" cx="12" cy="12" r="11" />
                        <path d="M14.5857864,11 L6,11 L6,13 L14.5857864,13 L10.5857864,17 L12,18.4142136 L18.4142136,12 L12,5.58578644 L10.5857864,7 L14.5857864,11 Z" />
                    </g>
                </svg>
            </button>
        );
    }
}
