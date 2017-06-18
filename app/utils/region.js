/**
 * Uitls - Region Enums
 *
 * @file region.js
 * @author mudio(job.mudio@gmail.com)
 */

export const REGION_BJ = 'bj';
export const REGION_GZ = 'gz';
export const REGION_SU = 'su';
export const REGION_HK = 'hk';

export function getLocalText(region) {
    switch (region) {
    case REGION_BJ:
        return '北京';
    case REGION_GZ:
        return '广州';
    case REGION_HK:
        return '香港';
    case REGION_SU:
        return '苏州';
    default:
        return region;
    }
}

export const regions = [REGION_BJ, REGION_GZ, REGION_HK];
