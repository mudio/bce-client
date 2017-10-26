/**
 * Component - Selection Component
 *
 * @file Selection.js
 * @author mudio(job.mudio@gmail.com)
 */

import _ from 'lodash';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, {Component} from 'react';

import styles from './Selection.css';

export default class Selection extends Component {
    static propTypes = {
        className: PropTypes.string,
        enabled: PropTypes.bool,
        children: PropTypes.node.isRequired,
        onSelectionChange: PropTypes.func
    };

    static defaultProps = {
        enabled: true,
        onSelectionChange: _.noop
    };

    constructor(props) {
        super(props);

        this.state = {
            mouseDown: false,
            startPoint: null,
            endPoint: null,
            selectionBox: null,
            appendMode: false,
        };
    }

    componentWillMount() {
        this.__selectedCache = {};
        this.__refPositionCache = {};
    }

    componentDidUpdate() {
        if (this.state.mouseDown && !_.isNull(this.state.selectionBox)) {
            this._updateCollidingChildren(this.state.selectionBox);
        }
    }

    clearSelection() {
        const keys = Object.keys(this.__selectedCache);
        if (keys.length > 0) {
            this.__selectedCache = {};
            this.props.onSelectionChange.call(null, []);
            this.forceUpdate();
        }
    }

    _onMouseDown(e) {
        if (!this.props.enabled || e.button === 2 || e.nativeEvent.which === 2) {
            return;
        }

        const nextState = {};
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            nextState.appendMode = true;
        }
        nextState.mouseDown = true;
        nextState.startPoint = {
            x: e.pageX,
            y: e.pageY
        };
        this.setState(nextState);

        this._mousemove = _.throttle(evt => this._onMouseMove(evt), 20);
        this._mouseup = evt => this._onMouseUp(evt);

        document.addEventListener('mousemove', this._mousemove);
        document.addEventListener('mouseup', this._mouseup);
    }

    _onMouseUp() {
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('mouseup', this._mouseup);

        this.setState({
            mouseDown: false,
            startPoint: null,
            endPoint: null,
            selectionBox: null,
            appendMode: false
        });
        this.props.onSelectionChange.call(null, _.keys(this.__selectedCache));
        // 清理以下缓存
        this.__refPositionCache = {};
    }

    _onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.state.mouseDown) {
            const endPoint = {
                x: e.pageX,
                y: e.pageY
            };
            this.setState({
                endPoint,
                selectionBox: this._calculateSelectionBox(this.state.startPoint, endPoint)
            });
        }
    }

    _onContextMenu(evt, key) {
        if (!_.has(this.__selectedCache, key)) {
            this.__selectedCache = {};
            this.selectItem(key, true);
        }
    }

    _boxIntersects(boxA, boxB) {
        if (boxA.left <= boxB.left + boxB.width
            && boxA.left + boxA.width >= boxB.left
            && boxA.top <= boxB.top + boxB.height
            && boxA.top + boxA.height >= boxB.top) {
            return true;
        }

        return false;
    }

    _updateCollidingChildren(selectionBox) {
        this.__selectedCache = {};

        _.each(this.refs, (ref, key) => {
            if (key !== 'selection') {
                // FIXME Forced reflow 导致性能太差，缓存一下
                if (!this.__refPositionCache[key]) {
                    const {
                        offsetTop,
                        offsetLeft,
                        clientWidth,
                        clientHeight
                    } = ReactDom.findDOMNode(ref).offsetParent; // eslint-disable-line react/no-find-dom-node

                    this.__refPositionCache[key] = {
                        top: offsetTop,
                        left: offsetLeft,
                        width: clientWidth,
                        height: clientHeight
                    };
                }

                if (this._boxIntersects(selectionBox, this.__refPositionCache[key])) {
                    this.__selectedCache[key] = true;
                } else if (!this.state.appendMode) {
                    delete this.__selectedCache[key];
                }
            }
        });
    }

    _calculateSelectionBox(startPoint, endPoint) {
        if (!this.state.mouseDown || _.isNull(endPoint) || _.isNull(startPoint)) {
            return null;
        }

        const {scrollTop} = this.refs.selection;
        const rect = this.refs.selection.getBoundingClientRect();
        const left = Math.min(startPoint.x, endPoint.x) - rect.left;
        const top = Math.min(startPoint.y, endPoint.y) + scrollTop - rect.top; // eslint-disable-line no-mixed-operators
        // +1 保证`MouseUp`事件在`SelectionBox`上
        const width = Math.abs(startPoint.x - endPoint.x) + 1;
        const height = Math.abs(startPoint.y - endPoint.y) + 1;
        return {left, top, width, height};
    }

    _onSelectItem(evt, key) {
        evt.preventDefault();

        const {enabled} = this.props;
        const {ctrlKey, shiftKey} = evt;

        if (enabled && (ctrlKey || shiftKey || evt.target.classList.contains('checkbox'))) {
            this.selectItem(key, !_.has(this.__selectedCache, key));
        } else {
            this.clearSelection();
        }
    }

    _onKeyDown(evt) {
        const {keyCode, ctrlKey, metaKey} = evt;

        if (keyCode === 65 && (ctrlKey || metaKey)) {
            evt.preventDefault();
            this.selectAll();
        }
    }

    selectItem(key, isSelected) {
        if (isSelected) {
            this.__selectedCache[key] = isSelected;
        } else {
            delete this.__selectedCache[key];
        }

        this.props.onSelectionChange.call(null, _.keys(this.__selectedCache));
    }

    selectAll() {
        _.each(this.refs, (ref, key) => {
            if (key !== 'selection') {
                this.__selectedCache[key] = true;
            }
        });

        this.props.onSelectionChange.call(null, _.keys(this.__selectedCache));
        this.forceUpdate();
    }

    renderChildren() {
        const nodes = _.flatten(this.props.children);

        return nodes.map(child => {
            const isSelected = _.has(this.__selectedCache, child.key);
            const styleName = classnames('selectionItem', {selected: isSelected});
            const tmpChild = React.cloneElement(
                child,
                {ref: child.key, isSelected, selectionParent: this}
            );

            return (
                <div key={child.key}
                    className={styleName}
                    onClick={evt => this._onSelectItem(evt, child.key)}
                    onContextMenu={evt => this._onContextMenu(evt, child.key)}
                >
                    <i className="fa fa-check-circle checkbox" />
                    {tmpChild}
                </div>
            );
        });
    }

    renderSelectionBox() {
        if (!this.state.mouseDown || _.isNull(this.state.endPoint) || _.isNull(this.state.startPoint)) {
            return null;
        }
        return (
            <div className={styles.selectionBox} style={this.state.selectionBox} />
        );
    }

    render() {
        const styleName = classnames(this.props.className, styles.container);

        return (
            <div ref="selection"
                tabIndex="0"        // eslint-disable-line
                className={styleName}
                onKeyDown={evt => this._onKeyDown(evt)}
                onClick={evt => this._onSelectItem(evt)}
                onMouseDown={evt => this._onMouseDown(evt)}
            >
                {this.renderChildren()}
                {this.renderSelectionBox()}
            </div>
        );
    }
}
