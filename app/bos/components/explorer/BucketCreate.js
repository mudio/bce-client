/**
 * Component - Bucket Create
 *
 * @file BucketCreate.js
 * @author Vito(hanxiao_do@126.com)
 */

import React from 'react';
import {Modal, Form, Input, Button, Select, Radio, notification} from 'antd';

import {kRegions, getLocalText, REGION_BJ, REGION_GZ} from '../../../utils/region';
import ErrorCode from '../../utils/ErrorCode';
import {
    storages,
    storageTextMap,
    STANDARD,
    ARCHIVE,
    accessDatasource,
    accessHelp,
    storageRegionMap
} from '../../../utils/enums';
import BrowserLink from '../common/BrowserLink';
import {ClientFactory} from '../../api/client';
import styles from './BucketCreate.css';

const FormItem = Form.Item;
const SelectOption = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 20},
};


class BucketCreate extends React.Component {
    state = {
        visible: false,
        region: REGION_BJ,
        storage: STANDARD,
        access: accessDatasource[0].value,
        bucketName: ''
    }

    getStorageHelp() {
        const {storage} = this.state;
        return (
            <div>
                <p className="tip">上传文件时如果未指定存储类型，则使用该默认存储类型</p>
                {
                    storage === ARCHIVE ? (
                        <p className={styles.tipFocus}>
                            归档存储类型针对较大文件的存储，且适用于平均3年访问一次的场景。
                            每位用户每天每PB归档存储文件最多支持取回35个文件，超出后当日无法取回，请根据自身访问情况酌情选择。
                        </p>
                    )
                        : ''
                }
                <p className="tip">
                    不同存储类型的使用场景和计费策略不同，且具有不同的使用限制，请在使用前务必查看并了解
                    <BrowserLink linkTo="https://cloud.baidu.com/doc/BOS/s/Bk24ffn89" className={styles.link}>
                        分级存储使用说明
                    </BrowserLink>
                </p>
            </div>
        );
    }

    handleInputChange = evt => {
        const {name, value} = evt.target;
        this.setState({[name]: value.trim()});
    }

    handleSelectChange = region => {
        const {storage} = this.state;
        this.setState({
            region,
            storage: storageRegionMap[region].includes(storage) ? storage : STANDARD
        });
    }

    cancelHandle = () => {
        this.props.form.setFieldsValue({
            bucketName: ''
        });
        this.setState({
            visible: false,
            region: REGION_BJ,
            storage: STANDARD,
            access: accessDatasource[0].value
        });
    }

    confirmHandle = async () => {
        const form = this.props.form;
        const state = this.state;
        await form.validateFields();
        try {
            const client = ClientFactory.fromRegion(state.region);
            await client.createBucket(state.bucketName, {...state});
            await client.putBucketStorageclass(state.bucketName, state.storage);
            await client.putBucketAcl(state.bucketName, state.access);
            this.setState({
                visible: false
            });
            notification.success({
                message: '创建成功',
                description: state.bucketName
            });
            this.cancelHandle();
            this.props.onSuccess();
        } catch (error) {
            ErrorCode[error.code]
                ? notification.error({message: ErrorCode[error.code]})
                : notification.error({message: error.code, description: error.message});
        }
    }

    saveFormRef = form => {
        this.form = form;
    }

    render() {
        const priceDoc = 'https://cloud.baidu.com/doc/BOS/s/Ok1rmtaow';
        const {visible, region, storage, access} = this.state;
        const baseStorages = storageRegionMap[region];
        const storageHelp = this.getStorageHelp();
        const {getFieldDecorator} = this.props.form;

        return (
            <div>
                <Modal
                    title="新建Bucket"
                    visible={visible}
                    width={700}
                    onOk={this.confirmHandle}
                    onCancel={this.cancelHandle}
                >
                    <Form {...layout} ref={this.saveFormRef}>
                        <FormItem
                            label="Bucket名称"
                            name="bucketName"
                            help="只能包含小写字母、数字和“-”，开头结尾为小写字母和数字，长度在3-63之间"
                        >
                            {
                                getFieldDecorator('bucketName', {
                                    rules: [
                                        {required: true, message: 'Bucket名称不能为空!'},
                                        {pattern: /^[a-z\d][a-z-\d]{1,61}[a-z\d]$/, message: 'Bucket名称不符合规则'}
                                    ]
                                })(
                                    <Input
                                        name="bucketName"
                                        placeholder="Bucket名称创建后不可修改，且在所有区域内唯一"
                                        onChange={this.handleInputChange}
                                    />
                                )
                            }
                        </FormItem>

                        <FormItem label="所属地域" name="region">
                            <Select name="region" value={region} onChange={this.handleSelectChange}>
                                {
                                    kRegions.map(region => {
                                        const regionText = getLocalText(region);
                                        return (<SelectOption value={region} key={region}>{regionText}</SelectOption>);
                                    })
                                }
                            </Select>
                        </FormItem>

                        <FormItem label="默认存储类型" name="storage" help={storageHelp}>
                            <RadioGroup name="storage" value={storage} onChange={this.handleInputChange}>
                                {baseStorages.map(storage => {
                                    return (
                                        <RadioButton value={storage} key={storage}>
                                            {storageTextMap[storage]}
                                        </RadioButton>
                                    );
                                })}
                            </RadioGroup>
                        </FormItem>

                        <FormItem label="读写权限" name="access" help={accessHelp[access]}>
                            <RadioGroup name="access" value={access} defaultValue="private" onChange={this.handleInputChange}>
                                {
                                    accessDatasource.map(item => {
                                        return (
                                            <RadioButton
                                                value={item.value}
                                                key={item.value}
                                            >
                                                {item.text}
                                            </RadioButton>
                                        );
                                    })
                                }

                            </RadioGroup>
                        </FormItem>
                        <FormItem label="计费方式" name="payType">
                            <div className="form-text">
                                <span>按用量收费</span>
                                <span className="tip margin-left-10">免费创建，使用阶段按照用量收费。</span>
                                <BrowserLink linkTo={priceDoc} className={styles.link}>
                                    了解计费详情
                                </BrowserLink>
                            </div>
                        </FormItem>

                    </Form>
                </Modal>
                <Button onClick={() => {this.setState({visible: true})}}>新建Bucket</Button>
            </div>

        );
    }
}
export default Form.create()(BucketCreate);
