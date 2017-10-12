/**
 * Component - ExplorerTool Component
 *
 * @file Tool.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';
import {Button, Radio} from 'antd';

import styles from './explorer_tool.css';

export default class ExplorerTool extends Component {
    render() {
        return (
            <div className={styles.container}>
                <Button type="primary" icon="upload" />
                <Button type="primary" icon="upload" />

                <Radio.Group onChange={this.handleSizeChange}>
                    <Radio.Button value="grid" icon="download">平铺</Radio.Button>
                    <Radio.Button value="list" icon="download">列表</Radio.Button>
                </Radio.Group>

                <Button>
                    <i className="fa fa-refresh" aria-hidden="true" />
                </Button>
            </div>
        );
    }
}
