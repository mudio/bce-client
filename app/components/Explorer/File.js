/**
 * Component - File Component
 *
 * @file File.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';
import styles from './File.css';

let extMap = {normal: 'fa-file-text'};
const imgIcon = 'fa-file-image-o';
const imgTag = ['jpg', 'jpge', 'bmp', 'png', 'icon', 'ico', 'psd', 'icns'];

const zipIcon = 'fa-file-zip-o';
const zipTag = ['rar', 'zip', '7z', 'tar', 'bz'];

extMap = imgTag.reduce((context, tag) => Object.assign(context, {[tag]: imgIcon}), extMap);
extMap = zipTag.reduce((context, tag) => Object.assign(context, {[tag]: zipIcon}), extMap);

export default class File extends Component {
    static propTypes = {
        item: PropTypes.shape({
            key: PropTypes.string.isRequired,
            lastModified: PropTypes.string.isRequired,
            ETag: PropTypes.string,
            Size: PropTypes.number
        }),
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
            view, rename, share,
            download, copy, move, trash
        } = this.props;

        onContextMenu([
            {name: '查看', icon: 'low-vision', click: () => view(item)},
            {name: '重命名', icon: 'pencil', click: () => rename(item)},
            {name: '分享', icon: 'chain', click: () => share(item)},
            {name: '下载', icon: 'cloud-download', click: () => download(item)},
            {name: '复制', icon: 'copy', click: () => copy(item)},
            {name: '移动到', icon: 'arrows', click: () => move(item)},
            {name: '删除', icon: 'trash', click: () => trash(item)}
        ], evt.clientX, evt.clientY);
    }

    render() {
        const {item} = this.props;
        const ext = item.key.split('.').pop().toLowerCase();
        const fileName = item.key.replace(/(.*\/)(.*)$/, '$2');

        return (
            <div
              className={styles.container}
              onContextMenu={evt => this._onContextMenu(evt)} // eslint-disable-line no-underscore-dangle
            >
                <i className={`fa fa-4x ${extMap[ext] || extMap.normal}`}></i>
                <span className={styles.text} title={fileName}>{fileName}</span>
            </div>
        );
    }
}
