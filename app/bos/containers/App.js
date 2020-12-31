/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';
import {ConfigProvider} from 'antd';
import {BrowserRouter} from 'react-router-dom';
import zhCN from 'antd/lib/locale-provider/zh_CN';

export default class App extends Component {
    props: {
        children: HTMLElement
    };

    render() {
        return (
            <div className="layout">
                <ConfigProvider locale={zhCN}>
                    {this.props.children}
                </ConfigProvider>
            </div>
        );
    }
}
