/**
 * Component - App Root Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';
import {LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

export default class App extends Component {
    props: {
        children: HTMLElement
    };

    render() {
        return (
            <div className="layout">
                <LocaleProvider locale={zhCN}>
                    {this.props.children}
                </LocaleProvider>
            </div>
        );
    }
}

