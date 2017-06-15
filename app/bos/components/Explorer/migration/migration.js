/**
 * Component - Migration Component
 *
 * @file Migration.js
 * @author mudio(job.mudio@gmail.com)
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {
    MENU_COPY_COMMAND,
    MENU_MOVE_COMMAND,
    MENU_RENAME_COMMAND
} from '../../../actions/context';
import Rename from './rename';

export default class Migration extends Component {
    static propTypes = {
        command: PropTypes.symbol,
        visible: PropTypes.bool.isRequired,
        onCancel: PropTypes.func.isRequired,
        onMigration: PropTypes.func.isRequired,

        region: PropTypes.string,
        bucket: PropTypes.string,
        object: PropTypes.string
    };

    onRename = () => {
        const form = this.form;
        const {region, bucket, object} = this.props;

        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            const objectParts = object.split('/');
            if (objectParts[objectParts.length - 1]) {
                objectParts[objectParts.length - 1] = values.name;
            } else {
                objectParts[objectParts.length - 2] = values.name;
            }

            this.props.onMigration({
                sourceBucket: bucket,
                sourceObject: object,
                targetRegion: region,
                targetBucket: bucket,
                targetObject: objectParts.join('/')
            }, true);
        });
    }

    saveFormRef = form => {
        this.form = form;
    }

    render() {
        const {object, command, visible, onCancel} = this.props;

        switch (command) {
        case MENU_COPY_COMMAND: {
            return null;
        }
        case MENU_MOVE_COMMAND: {
            return null;
        }
        case MENU_RENAME_COMMAND: {
            return (
                <Rename ref={this.saveFormRef}
                    visible={visible}
                    object={object}
                    onCancel={onCancel}
                    onCreate={this.onRename}
                />
            );
        }
        default: {
            return null;
        }
        }
    }
}
