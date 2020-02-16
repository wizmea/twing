"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("../../../error/runtime");
const locutusRound = require('locutus/php/math/round');
const ceil = require('locutus/php/math/ceil');
const floor = require('locutus/php/math/floor');
/**
 * Rounds a number.
 *
 * @param value The value to round
 * @param {number} precision The rounding precision
 * @param {string} method The method to use for rounding
 *
 * @returns {Promise<number>} The rounded number
 */
function round(value, precision = 0, method = 'common') {
    let _do = () => {
        if (method === 'common') {
            return locutusRound(value, precision);
        }
        if (method !== 'ceil' && method !== 'floor') {
            throw new runtime_1.TwingErrorRuntime('The round filter only supports the "common", "ceil", and "floor" methods.');
        }
        let intermediateValue = value * Math.pow(10, precision);
        let intermediateDivider = Math.pow(10, precision);
        if (method === 'ceil') {
            return ceil(intermediateValue) / intermediateDivider;
        }
        else {
            return floor(intermediateValue) / intermediateDivider;
        }
    };
    return Promise.resolve(_do());
}
exports.round = round;
