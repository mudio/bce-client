/**
 * Base - Render Root File
 *
 * @file index.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import React, {Component} from 'react';

import LoginPage from './LoginPage';

export default class Root extends Component {
    static propTypes = {
        store: PropTypes.object.isRequired
    };

    render() {
        return (
            <Provider store={this.props.store}>
                <LoginPage />
            </Provider>
        );
    }
}
