/**
 * Component - Extensions Page
 *
 * @file Extensions.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component} from 'react';

import styles from './Extensions.css';
import {REGION_BJ} from '../../utils/region';
import SystemBar from './common/SystemBar';
import {getRegionClient} from '../api/client';

export default class Extensions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extensions: []
        };
    }

    componentDidMount() {
        const _client = getRegionClient(REGION_BJ);

        _client.getObject('bce-client', 'update/extensions.json').then(
            res => {
                try {
                    const {extensions} = JSON.parse(res.body.toString());
                    this.setState({extensions});
                } catch (ex) {
                    this.setState({extensions: []});
                }
            }
        );
    }

    renderExtensions() {
        const extensions = this.state.extensions;

        return extensions.map(ext =>
            <div key={ext.name} className={styles.extItem}>
                <div>
                    <img src={ext.icon} alt={ext.name} />
                    <div className={styles.summary}>
                        <div className={styles.name}>{ext.name}@1.1.1</div>
                        <div className={styles.desc}>{ext.desc}</div>
                    </div>
                </div>
                <div className={styles.operation}>
                    <div className={styles.author}>©{ext.author}</div>
                    <div className={styles.tools}>
                        <button className={styles.upgrade}>
                            <i className="fa fa-cloud-download" /> 安装服务
                        </button>
                        <button><i className="fa fa-trash" /> 卸载</button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className={styles.container}>
                <SystemBar />
                <div className={styles.search}>
                    <input placeholder="🔍 请输入关键字搜索" />
                </div>
                <div className={styles.extensions} >
                    {this.renderExtensions()}
                </div>
            </div>
        );
    }
}
