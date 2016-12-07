/**
 * Algorithm - Bimap
 *
 * @file Bimap.js
 * @author mudio(job.mudio@gmail.com)
 */

/* eslint-disable no-bitwise */

export default class Bimap {
    constructor() {
        this._index = 0;
        this._buffer = [];
        this._maxValue = 0x7fffffff;
    }

    calloc() {
        if (this._index >= Number.MAX_SAFE_INTEGER) {
            throw new Error(`Bimap length exceed, maxLen = ${Number.MAX_SAFE_INTEGER}`);
        }

        const index = parseInt(this._index / 31, 10);
        let value = this._buffer[index] || 0;
        let hex = 1;

        if (value > 0) {
            const old = this._buffer[index];
            value <<= 1;
            value += 1;
            hex = (value ^ old).toString(16);
        } else {
            value += 1;
        }

        this._buffer[index] = value;
        this._index += 1;

        return `${index}x${hex}`;
    }

    dump() {
        return [...this._buffer];
    }

    check(key) {
        if (!/^\d+x\d{1,8}$/.test(key)) {
            throw new Error(`Invalid Bimap key = ${key}`);
        }

        const parts = key.split('x');
        const index = parseInt(parts[0], 10);
        const value = parseInt(`0x${parts[1]}`, 16);

        return this._buffer[index] & value;
    }
}
