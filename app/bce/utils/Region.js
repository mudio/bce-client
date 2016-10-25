/**
 * Uitls - Region Enums
 *
 * @file region.js
 * @author mudio(job.mudio@gmail.com)
 */

export const REGION_BJ = 'bj';
export const REGION_GZ = 'gz';
export const REGION_HK = 'hk';

export function getLocalText(region) {
    switch (region) {
    case REGION_BJ:
        return '北京区域';
    case REGION_GZ:
        return '广州区域';
    case REGION_HK:
        return '香港区域';
    default:
        return region;
    }
}

export const regions = [REGION_BJ, REGION_GZ];
