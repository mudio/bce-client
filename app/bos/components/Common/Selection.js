/**
 * Component - Selection Component
 *
 * @file Selection.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0, no-underscore-dangle: [2, { "allowAfterThis": true }] */

import _ from 'lodash';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, {Component} from 'react';

import styles from './Selection.css';
import ContextMenu from './ContextMenu';

export default class Selection extends Component {
    static propTypes = {
        enabled: PropTypes.bool,
        commands: PropTypes.array,
        children: PropTypes.node.isRequired,
        onSelectionChange: PropTypes.func,
        onCommand: PropTypes.func.isRequired
    };

    static defaultProps = {
        commands: [],
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
            contextMenu: null
        };
    }

    componentWillMount() {
        this.selectedChildren = {};
    }

    componentDidUpdate() {
        if (this.state.mouseDown && !_.isNull(this.state.selectionBox)) {
            this._updateCollidingChildren(this.state.selectionBox);
        }
    }

    clearSelection() {
        const keys = Object.keys(this.selectedChildren);
        if (keys.length > 0) {
            this.selectedChildren = {};
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

        this._mousemove = evt => this._onMouseMove(evt);
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
        this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
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
        const {pageX, pageY} = evt;
        const rect = this.refs.selection.getBoundingClientRect();

        if (!_.has(this.selectedChildren, key)) {
            this.selectedChildren = {};
            this.selectItem(key, true);
        }

        this.setState({
            contextMenu: {
                pageX,
                pageY,
                offsetX: pageX - rect.left,
                offsetY: pageY - rect.top
            }
        });
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
        _.each(this.refs, (ref, key) => {
            if (key !== 'selection') {
                const {
                    offsetTop,
                    offsetLeft,
                    clientWidth,
                    clientHeight
                } = ReactDom.findDOMNode(ref); // eslint-disable-line react/no-find-dom-node

                const box = {
                    top: offsetTop,
                    left: offsetLeft,
                    width: clientWidth,
                    height: clientHeight
                };

                if (this._boxIntersects(selectionBox, box)) {
                    this.selectedChildren[key] = true;
                } else if (!this.state.appendMode) {
                    delete this.selectedChildren[key];
                }
            }
        });
    }

    _calculateSelectionBox(startPoint, endPoint) {
        if (!this.state.mouseDown || _.isNull(endPoint) || _.isNull(startPoint)) {
            return null;
        }
        const rect = this.refs.selection.getBoundingClientRect();
        const left = Math.min(startPoint.x, endPoint.x) - rect.left;
        const top = Math.min(startPoint.y, endPoint.y) - rect.top;
        // +1 保证`MouseUp`事件在`SelectionBox`上
        const width = Math.abs(startPoint.x - endPoint.x) + 1;
        const height = Math.abs(startPoint.y - endPoint.y) + 1;

        return {left, top, width, height};
    }

    _onSelectItem(evt, key) {
        evt.stopPropagation();
        const {enabled} = this.props;
        const {ctrlKey, shiftKey} = evt;

        if (enabled && (ctrlKey || shiftKey || evt.target.classList.contains(styles.checkbox))) {
            evt.preventDefault();
            evt.stopPropagation();
            this.selectItem(key, !_.has(this.selectedChildren, key));
        } else {
            this.clearSelection();
        }

        this.setState({contextMenu: null});
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
            this.selectedChildren[key] = isSelected;
        } else {
            delete this.selectedChildren[key];
        }

        this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
    }

    selectAll() {
        _.each(this.refs, (ref, key) => {
            if (key !== 'selection') {
                this.selectedChildren[key] = true;
            }
        });

        this.props.onSelectionChange.call(null, this.selectedChildren);
        this.forceUpdate();
    }

    renderChildren() {
        const nodes = _.flatten(this.props.children);

        return nodes.map(child => {
            const isSelected = _.has(this.selectedChildren, child.key);
            const tmpChild = React.cloneElement(
                child,
                {ref: child.key, isSelected, selectionParent: this}
            );

            return (
                <div key={child.key}
                    onContextMenu={evt => this._onContextMenu(evt, child.key)}
                    onClick={evt => this._onSelectItem(evt, child.key)}
                    className={classnames(styles.selectionItem, {[styles.selected]: isSelected})}
                >
                    <i className={classnames('fa', 'fa-check-circle', styles.checkbox)} />
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

    renderContextMenu() {
        const {enabled, commands, onCommand} = this.props;
        const {contextMenu} = this.state;

        if (!enabled || _.isNull(contextMenu)) {
            return null;
        }

        return (
            <ContextMenu ref="_contextMenu"
                {...contextMenu}
                commands={commands}
                onCommand={cmd => onCommand(cmd, {keys: Object.keys(this.selectedChildren)})}
            />
        );
    }

    render() {
        return (
            <div ref="selection"
                tabIndex="0"        // eslint-disable-line
                className={styles.selection}
                onClick={evt => this._onSelectItem(evt)}
                onKeyDown={evt => this._onKeyDown(evt)}
                onMouseDown={evt => this._onMouseDown(evt)}
            >
                {this.renderChildren()}
                {this.renderSelectionBox()}
                {this.renderContextMenu()}
            </div>
        );
    }
}
