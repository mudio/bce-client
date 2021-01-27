/**
 * Component - Copy Component
 *
 * @file Copy.js
 * @author mudio(job.mudio@gmail.com)
 */

import React from 'react';
import {Modal, Cascader, Form} from 'antd';

const FormItem = Form.Item;

export default Form.create()(props => {
    const {visible, onCancel, onCopy, loadData, buckets, form, bucket} = props;
    const {getFieldDecorator} = form;
    const isMultiAzEnabled = !!(Array.isArray(buckets) && buckets.find(item => item.value === bucket && item.enableMultiAz));
    const filteredBucketList = buckets.filter(item => item.enableMultiAz === isMultiAzEnabled);

    return (
        <Modal title="复制到"
            width={400}
            visible={visible}
            onCancel={onCancel}
            onOk={onCopy}
        >
            <Form layout="vertical">
                <FormItem label="复制到：">
                    {
                        getFieldDecorator('path', {
                            rules: [{
                                required: true,
                                message: '输入名称不能为空!'
                            }]
                        })(
                            <Cascader options={filteredBucketList} loadData={loadData} changeOnSelect />
                        )
                    }
                </FormItem>
            </Form>
        </Modal>
    );
});
