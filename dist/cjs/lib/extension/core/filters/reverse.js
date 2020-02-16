"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reverse_1 = require("../../../helpers/reverse");
const iterator_to_map_1 = require("../../../helpers/iterator-to-map");
const esrever = require('esrever');
/**
 * Reverses a variable.
 *
 * @param {TwingEnvironment} env
 * @param {string | Map<*, *>} item A traversable instance, or a string
 * @param {boolean} preserveKeys Whether to preserve key or not
 *
 * @returns {Promise<string | Map<any, any>>} The reversed input
 */
function reverse(env, item, preserveKeys = false) {
    if (typeof item === 'string') {
        return Promise.resolve(esrever.reverse(item));
    }
    else {
        return Promise.resolve(reverse_1.reverse(iterator_to_map_1.iteratorToMap(item), preserveKeys));
    }
}
exports.reverse = reverse;
