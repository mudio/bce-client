/**
 * Component - ObjectMenu Component
 *
 * @file ObjectMenu.js
 * @author mudio(job.mudio@gmail.com)
 */

import {Radio} from 'antd';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';

import styles from './ObjectMenu.css';
import {syncLayout} from '../../actions/explorer';

class ObjectMenu extends Component {
    static propTypes = {
        layout: PropTypes.string.isRequired,
        syncLayout: PropTypes.func.isRequired
    }

    _handleModelChange = (evt) => {
        this.props.syncLayout(evt.target.value);
    }

    render() {
        const {layout} = this.props;

        return (
            <div className={styles.container}>
                <Radio.Group value={layout} onChange={this._handleModelChange}>
                    <Radio.Button value="grid" icon="download">平铺</Radio.Button>
                    <Radio.Button value="list" icon="download">列表</Radio.Button>
                </Radio.Group>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {layout: state.explorer.layout};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({syncLayout}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ObjectMenu);
