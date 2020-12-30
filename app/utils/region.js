/**
 * Uitls - Region Enums
 *
 * @file region.js
 * @author mudio(job.mudio@gmail.com)
 */

export const REGION_BJ = 'bj';
export const REGION_BD = 'bd';
export const REGION_GZ = 'gz';
export const REGION_SU = 'su';
export const REGION_HK02 = 'hk02';

export const REGION_HKG = 'hkg';
export const REGION_FSH = 'fsh';
export const REGION_FWH = 'fwh';
export const REGION_SIN = 'sin';

export function getLocalText(region) {
    switch (region) {
    case REGION_BJ:
        return '华北-北京';
    case REGION_GZ:
        return '华南-广州';
    case REGION_HKG:
        return '香港';
    case REGION_HK02:
        return '香港2区';
    case REGION_SU:
        return '华东-苏州';
    case REGION_BD:
        return '华北-保定';
    case REGION_FSH:
        return '华东-上海';
    case REGION_FWH:
        return '金融华中-武汉';
    case REGION_SIN:
        return '新加坡';
    default:
        return region;
    }
}

export const kRegions = [REGION_BJ, REGION_BD, REGION_GZ, REGION_FSH, REGION_SU, REGION_FWH, REGION_HKG, REGION_SIN];
