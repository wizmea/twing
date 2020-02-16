"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param value
 * @returns {boolean}
 */
const util_1 = require("util");
/**
 * Check that an obejct is traversable in the sense of PHP,
 * i.e. implements PHP Traversable interface
 *
 * @param value
 * @returns {boolean}
 */
function isTraversable(value) {
    if (!util_1.isNullOrUndefined(value)) {
        if (typeof value === 'string') {
            return false;
        }
        if (typeof value['entries'] === 'function') {
            return true;
        }
        if ((typeof value[Symbol.iterator] === 'function') || (typeof value['next'] === 'function')) {
            return true;
        }
    }
    return false;
}
exports.isTraversable = isTraversable;
