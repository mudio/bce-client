/**
 * Component - File/Folder ContextMenu Component
 *
 * @file ContextMenu.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';
import styles from './ContextMenu.css';

export default class ContextMenu extends Component {
    static propTypes = {
        onRemove: PropTypes.func
    };

    constructor(...args) {
        super(...args);
        this.state = {
            positionX: 0,
            positionY: 0,
            datasource: [],
            visibility: 'hidden'
        };
    }

    popup(datasource, positionX, positionY) {
        this.setState({
            positionX,
            positionY,
            datasource,
            visibility: 'visible'
        });
    }

    hide() {
        this.setState({visibility: 'hidden'});
    }

    render() {
        const {datasource, visibility, positionX, positionY} = this.state;

        return (
            <div className={styles.container} style={{left: positionX, top: positionY, visibility}}>
                {
                    datasource.map((item, index) => (
                        <div
                          key={index}
                          onClick={item.click}
                          className={item.icon === 'trash' ? `${styles.menuItem} ${styles.trash}` : styles.menuItem}
                        >
                            <i className={`fa fa-${item.icon} fa-fw`} />
                            {item.name}
                        </div>
                    ))
                }
            </div>
        );
    }
}
