/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.element.isRequired
    }

    render() {
        return (
            <div className="layout">
                {this.props.children}
            </div>
        );
    }
}

