"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const locutusNumberFormat = require('locutus/php/strings/number_format');
/**
 * Number format filter.
 *
 * All of the formatting options can be left null, in that case the defaults will
 * be used.  Supplying any of the parameters will override the defaults set in the
 * environment object.
 *
 * @param {TwingEnvironment} env
 * @param {*} number A float/int/string of the number to format
 * @param {number} decimal the number of decimal points to display
 * @param {string} decimalPoint the character(s) to use for the decimal point
 * @param {string} thousandSep the character(s) to use for the thousands separator
 *
 * @returns {Promise<string>} The formatted number
 */
function numberFormat(env, number, decimal, decimalPoint, thousandSep) {
    let coreExtension = env.getCoreExtension();
    let defaults = coreExtension.getNumberFormat();
    if (util_1.isNullOrUndefined(decimal)) {
        decimal = defaults[0];
    }
    if (util_1.isNullOrUndefined(decimalPoint)) {
        decimalPoint = defaults[1];
    }
    if (util_1.isNullOrUndefined(thousandSep)) {
        thousandSep = defaults[2];
    }
    return Promise.resolve(locutusNumberFormat(number, decimal, decimalPoint, thousandSep));
}
exports.numberFormat = numberFormat;
