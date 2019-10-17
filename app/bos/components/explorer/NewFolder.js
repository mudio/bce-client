/**
 * Component - Migration Component
 *
 * @file Migration.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {Input, Modal, Icon, Form, Alert} from 'antd';

const FormItem = Form.Item;

export default Form.create({})(
    (props) => {
        const {visible, onCancel, onConfirm, form} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal title="新建文件夹"
                width={400}
                visible={visible}
                onCancel={onCancel}
                onOk={onConfirm}
            >
                <Form layout="vertical">
                    <FormItem label="文件夹名称：">
                        {
                            getFieldDecorator('name', {
                                rules: [
                                    {required: true, message: '文件夹名称不能为空'},
                                    {pattern: /^((?!\/).)*$/, message: '文件夹名称不能包含/'}
                                ]
                            })(
                                <Input placeholder="请输入文件夹的名称"
                                    prefix={<Icon type="edit" style={{fontSize: 13}} />}
                                />
                            )
                        }
                    </FormItem>
                </Form>
            </Modal>
        );
    }
);
