/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';

export default class App extends Component {
    props: {
        children: HTMLElement
    };

    render() {
        return (
            <div className="layout">
                {this.props.children}
            </div>
        );
    }
}

