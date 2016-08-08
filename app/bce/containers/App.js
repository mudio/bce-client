/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import {hashHistory} from 'react-router';
import React, {Component, PropTypes} from 'react';

import Footer from '../components/App/Footer';
import SideBar from '../components/App/SideBar';

export default class App extends Component {
    static propTypes = {
        children: PropTypes.element.isRequired,
        location: PropTypes.object.isRequired
    };

    handleChange(nextValue) {
        hashHistory.push(nextValue);
    }

    render() {
        return (
            <div className="layout">
                <div className="layout-content">
                    <SideBar />
                    {this.props.children}
                </div>
                <Footer className="layout-footer" />
            </div>
        );
    }
}

