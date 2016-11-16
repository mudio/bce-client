/**
 * Component - Selection Component
 *
 * @file Selection.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint react/no-string-refs: 0, no-underscore-dangle: [2, { "allowAfterThis": true }] */

import _ from 'lodash';
import ReactDom from 'react-dom';
import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

import styles from './Selection.css';

export default class Selection extends Component {
    static propTypes = {
        enabled: PropTypes.bool,
        onSelectionChange: PropTypes.func,
        children: PropTypes.node.isRequired
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
            selectedItems: {},
            appendMode: false
        };
    }

    componentWillMount() {
        this.selectedChildren = {};
    }

    componentWillReceiveProps(nextProps) {
        const nextState = {};
        if (!nextProps.enabled) {
            nextState.selectedItems = {};
        }
        this.setState(nextState);
    }

    componentDidUpdate() {
        if (this.state.mouseDown && !_.isNull(this.state.selectionBox)) {
            this._updateCollidingChildren(this.state.selectionBox);
        }
    }

    clearSelection() {
        this.selectedChildren = {};
        this.props.onSelectionChange.call(null, []);
        this.forceUpdate();
    }

    _onMouseDown(e) {
        if (!this.props.enabled || e.button === 2 || e.nativeEvent.which === 2) {
            return;
        }

        const nextState = {};
        if (e.ctrlKey || e.altKey || e.shiftKey) {
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

        window.document.addEventListener('mousemove', this._mousemove);
        window.document.addEventListener('mouseup', this._mouseup);
    }

    _onMouseUp() {
        window.document.removeEventListener('mousemove', this._mousemove);
        window.document.removeEventListener('mouseup', this._mouseup);

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
        const width = Math.abs(startPoint.x - endPoint.x);
        const height = Math.abs(startPoint.y - endPoint.y);

        return {left, top, width, height};
    }

    _onSelectItem(evt, key) {
        const {enabled} = this.props;
        const {ctrlKey, altKey, shiftKey} = evt;

        if (enabled && (ctrlKey || altKey || shiftKey)) {
            evt.preventDefault();
            evt.stopPropagation();
            this.selectItem(key, !_.has(this.selectedChildren, key));
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
            this.selectedChildren[key] = isSelected;
        } else {
            delete this.selectedChildren[key];
        }

        this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
        this.forceUpdate();
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
        let index = 0;
        const nodes = _.flatten(this.props.children);

        return nodes.map(child => {
            const tmpKey = _.isNull(child.key) ? index++ : child.key; // eslint-disable-line no-plusplus
            const isSelected = _.has(this.selectedChildren, tmpKey);
            const tmpChild = React.cloneElement(
                child,
                {ref: tmpKey, isSelected, selectionParent: this}
            );

            return (
                <div key={tmpKey}
                    onClick={evt => this._onSelectItem(evt, tmpKey)}
                    className={classnames(styles.selectionItem, {[styles.selected]: isSelected})}
                >
                    <i className={classnames('fa', 'fa-check-circle', {[styles.checkbox]: true})} />
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
        return (
            <div ref="selection"
                tabIndex="0"
                onKeyDown={evt => this._onKeyDown(evt)}
                className={styles.selection}
                onMouseDown={evt => this._onMouseDown(evt)}
            >
                {this.renderChildren()}
                {this.renderSelectionBox()}
            </div>
        );
    }
}
