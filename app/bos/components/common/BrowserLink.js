/**
 * Component - BrowserLink Component
 *
 * @file BrowserLink.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const {shell} = electron;

export default class BrowserLink extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node.isRequired,
        linkTo: PropTypes.string.isRequired
    };

    openExternalLink = () => {
        const {linkTo} = this.props;
        shell.openExternal(linkTo);
    }

    render() {
        const {className, children} = this.props;

        return (
            <span className={className} onClick={this.openExternalLink}>
                {children}
            </span>
        );
    }
}
