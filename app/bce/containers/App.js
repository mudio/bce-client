/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import electron from 'electron';
import React, {Component, PropTypes} from 'react';

const browserWindow = electron.remote.getCurrentWindow();

export default class App extends Component {
    static propTypes = {
        children: PropTypes.element.isRequired
    }

    getSystemBar() {
        if (process.platform === 'win32') {
            return (
                <div className="window-bar">
                    <div className="fa fa-minus min" onClick={this.minimize} />
                    <div className="fa fa-expand max" onClick={this.toggleMaximize} />
                    <div className="fa fa-times exit" onClick={this.close} />
                </div>
            );
        }
        // return (
        //     <Link to="/login">
        //          <div className="fa fa-lock lock" />
        //     </Link>
        //     <Link to="/login" className="darwin-bar">
        //          <i className="fa fa-lg fa-power-off" />
        //     </Link>
        // );
    }

    close() {
        browserWindow.close();
    }

    toggleMaximize() {
        if (browserWindow.isMaximized()) {
            browserWindow.unmaximize();
        } else {
            browserWindow.maximize();
        }
    }

    minimize() {
        browserWindow.minimize();
    }

    render() {
        return (
            <div className="layout">
                {this.getSystemBar()}
                {this.props.children}
            </div>
        );
    }
}

