/**
 * Component - File Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import path from 'path';
import {Tooltip} from 'antd';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import styles from './File.css';
import {ClientFactory} from '../../api/client';
import {BosCategory} from '../../utils/BosType';
import {humanSize, utcToLocalTime} from '../../utils/utils';

export default class File extends Component {
    static propTypes = {
        layout: PropTypes.string.isRequired,
        bucket: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        eTag: PropTypes.string.isRequired,
        size: PropTypes.number.isRequired,
        lastModified: PropTypes.string.isRequired,
        storageClass: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            id: PropTypes.string.isRequired,
            displayName: PropTypes.string.isRequired
        }).isRequired
    };

    state = {
        imgThumbnail: ''
    }

    componentDidMount() {
        _.delay(() => this.loadThumbnail(), 300);
    }

    shouldComponentUpdate(props, nextState) {
        return props.name !== this.props.name
            || props.layout !== this.props.layout
            || nextState.imgThumbnail !== this.state.imgThumbnail;
    }

    async loadThumbnail() {
        const {bucket, name, eTag} = this.props;
        const extname = path.extname(name);
        const params = '@w_48,f_png';

        if (!['.jpg', '.png', '.bmp', '.webp', '.gif', '.tiff'].includes(extname)) {
            return;
        }

        try {
            const _client = await ClientFactory.fromBucket(bucket);
            const base64Data = await _client.getThumbnail(bucket, `${name}${params}`, eTag);

            this.setState({imgThumbnail: base64Data});
        } catch (ex) {} // eslint-disable-line no-empty
    }

    render() {
        const {imgThumbnail} = this.state;
        const style = imgThumbnail ? {backgroundImage: `url("${imgThumbnail}")`} : {};
        const {name, size, lastModified, storageClass, layout} = this.props;
        const ext = name.split('.').pop().toLowerCase();
        const fileName = name.replace(/(.*\/)(.*)$/, '$2');

        if (layout === 'grid') {
            return (
                <div className={styles.gridLayout}>
                    <i style={style} className={`${styles.icon} asset-normal asset-${ext}`} />
                    <Tooltip placement="bottom" title={fileName}>
                        <span className={styles.text}>
                            {fileName}
                        </span>
                    </Tooltip>
                </div>
            );
        }

        if (layout === 'list') {
            return (
                <div className={styles.listLayout}>
                    <i style={style} className={`${styles.icon} asset-normal asset-${ext}`} />
                    <span className={styles.text}>{fileName}</span>
                    <span className={styles.commands}>
                        <span className="fa fa-chain" />
                        <span className="fa fa-copy" />
                        <span className="fa fa-trash" />
                    </span>
                    <span className={styles.extra}>{BosCategory[storageClass]}</span>
                    <span className={styles.extra}>{humanSize(size)}</span>
                    <span className={styles.extra}>{utcToLocalTime(lastModified)}</span>
                </div>
            );
        }

        return null;
    }
}
