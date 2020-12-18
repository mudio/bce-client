/**
 * Component - Migration Component
 *
 * @file Migration.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {Input, Modal, Icon, Form, Alert} from 'antd';

const FormItem = Form.Item;

export default Form.create({
    mapPropsToFields(props) {
        // 如果是文件，则name[1]为名称，否则name[0]
        const name = props.object.split('/').slice(-2);

        return {
            name: Form.createFormField({
                value: name[1] || name[0]
            })
        };
    }
})(
    (props) => {
        const {visible, onCancel, onCreate, form, object} = props;
        const {getFieldDecorator} = form;
        const message = '文件夹重命名操作时长与文件夹内文件数量有关，数量较多时耗时较长，重命名过程中请保持网络畅通，耐心等待';
        const tip = object[object.length - 1] === '/'
            ? <FormItem><Alert message={message} type="info" showIcon /></FormItem> : null;

        return (
            <Modal title="重命名"
                width={400}
                visible={visible}
                onCancel={onCancel}
                onOk={onCreate}
            >
                <Form layout="vertical">
                    {tip}
                    <FormItem label="重命名为：">
                        {
                            getFieldDecorator('name', {
                                rules: [
                                    {required: true, message: '输入名称不能为空!'},
                                    {pattern: /^((?!\/).)*$/, message: '输入名称不能包含/'}
                                ]
                            })(
                                <Input placeholder="请输入新的名称"
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
