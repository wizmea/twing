"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check whether a string consists of numerical character(s) only.
 *
 * @param {string} value
 * @return boolean
 */
function ctypeDigit(value) {
    let regExp = /^\d+$/;
    return regExp.test(value);
}
exports.ctypeDigit = ctypeDigit;
