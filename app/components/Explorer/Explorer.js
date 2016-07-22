/**
 * Component - Explorer Component
 *
 * @file Explorer.js
 * @author mudio(job.mudio@gmail.com)
 */

import React, {Component, PropTypes} from 'react';

import Url from './Url';
import Tool from './Tool';
import Window from './Window';
import styles from './Explorer.css';

const ICON_MODEL = 'icon_model';
const LIST_MODEL = 'list_model';

export default class Explorer extends Component {
    static propTypes = {
        nav: PropTypes.shape({
            region: PropTypes.string.isRequired,
            bucket: PropTypes.string,
            folder: PropTypes.string
        }),
        params: React.PropTypes.shape({
            region: React.PropTypes.string
        }),
        updateNavigator: PropTypes.func.isRequired
    };

    componentDidMount() {
        const {updateNavigator} = this.props;
        updateNavigator({region: this.props.params.region});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.region !== this.props.params.region) {
            const {updateNavigator} = nextProps;
            updateNavigator({region: nextProps.params.region});
        }
    }

    render() {
        const {nav, updateNavigator} = this.props;

        return (
            <div className={styles.container}>
                <Url nav={nav} updateNavigator={updateNavigator} />
                <Tool models={[ICON_MODEL, LIST_MODEL]} />
                <Window
                  nav={nav}
                  model={ICON_MODEL}
                  onDBClick={noop => noop}
                  onSelect={noop => noop}
                  onDownload={noop => noop}
                  onDrop={noop => noop}
                  onCopy={noop => noop}
                  onViscidity={noop => noop}
                />
            </div>
        );
    }
}
