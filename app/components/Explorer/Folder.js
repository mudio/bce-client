/**
 * Component - Folder Component
 *
 * @file Folder.js
 * @author mudio(job.mudio@gmail.com)
 */

import styles from './Folder.css';
import React, {Component, PropTypes} from 'react';

export default class Folder extends Component {
    static propTypes = {
        item: PropTypes.shape({
            name: PropTypes.string.isRequired
        }),
        onDoubleClick: PropTypes.func.isRequired,
        onContextMenu: PropTypes.func.isRequired,
        view: PropTypes.func.isRequired,
        rename: PropTypes.func.isRequired,
        share: PropTypes.func.isRequired,
        download: PropTypes.func.isRequired,
        copy: PropTypes.func.isRequired,
        move: PropTypes.func.isRequired,
        trash: PropTypes.func.isRequired
    };

    _onContextMenu(evt) {
        evt.preventDefault();
        const {
            item, onContextMenu,
            view, rename, download, copy, move, trash
        } = this.props;

        onContextMenu([
            {name: '查看', icon: 'low-vision', click: () => view(item)},
            {name: '重命名', icon: 'pencil', click: () => rename(item)},
            {name: '下载', icon: 'cloud-download', click: () => download(item)},
            {name: '复制', icon: 'copy', click: () => copy(item)},
            {name: '移动到', icon: 'arrows', click: () => move(item)},
            {name: '删除', icon: 'trash', click: () => trash(item)}
        ], evt.clientX, evt.clientY);
    }

    render() {
        const {item, onDoubleClick} = this.props;

        return (
            <div
              className={styles.container}
              onContextMenu={evt => this._onContextMenu(evt)} // eslint-disable-line no-underscore-dangle
              onDoubleClick={() => onDoubleClick(item.name)}
            >
                <i className={`fa fa-4x fa-folder ${styles.folder}`}></i>
                <span className={styles.text}>{item.name.replace(/(.*\/)?(.*)\/$/, '$2')}</span>
            </div>
        );
    }
}
