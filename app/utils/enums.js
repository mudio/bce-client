/**
 * Uitls - Enums
 *
 * @file enums.js
 * @author Vito(hanxiao_do@126.com)
 */

import {REGION_BJ, REGION_BD, REGION_GZ, REGION_SU, REGION_FSH, REGION_FWH, REGION_HKG, REGION_SIN} from './region.js';

export const STANDARD = 'STANDARD';
export const STANDARD_IA = 'STANDARD_IA';
export const COLD = 'COLD';
export const ARCHIVE = 'ARCHIVE';
export const MAZ_STANDARD = 'MAZ_STANDARD';
export const MAZ_STANDARD_IA = 'MAZ_STANDARD_IA';

export const storageTextMap = {
    STANDARD: '标准存储',
    STANDARD_IA: '低频存储',
    COLD: '冷存储',
    MAZ_STANDARD: '标准存储-多AZ',
    MAZ_STANDARD_IA: '低频存储-多AZ',
    ARCHIVE: '归档存储'
};

export const storageRegionMap = {
    [REGION_BJ]: [STANDARD, STANDARD_IA, COLD, ARCHIVE],
    [REGION_SU]: [STANDARD, STANDARD_IA, COLD, ARCHIVE],
    [REGION_GZ]: [STANDARD, STANDARD_IA, COLD, ARCHIVE],
    [REGION_FWH]: [STANDARD, STANDARD_IA, COLD],
    [REGION_BD]: [STANDARD, STANDARD_IA, COLD],
    [REGION_SIN]: [STANDARD, STANDARD_IA, COLD],
    [REGION_FSH]: [STANDARD],
    [REGION_HKG]: [STANDARD, STANDARD_IA]
};

export const storages = [STANDARD, STANDARD_IA, COLD, ARCHIVE];

export const accessDatasource = [
    {text: '私有', value: 'private'},
    {text: '公共读', value: 'public-read'},
    {text: '公共读写', value: 'public-read-write'}
];

export const accessHelp = {
    private: '私有：只有用户本人可读写该Bucket中的数据',
    'public-read': '公共读：所有人均可读取该Bucket中的数据',
    'public-read-write': '公共读写：所有人均可读写该Bucket中的数据'
}
