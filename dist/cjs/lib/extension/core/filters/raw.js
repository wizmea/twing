"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Marks a variable as being safe.
 *
 * @param {string | TwingMarkup} string A variable
 *
 * @return {Promise<string>}
 */
function raw(string) {
    return Promise.resolve(string.toString());
}
exports.raw = raw;
