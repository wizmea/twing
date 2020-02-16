"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("../../../error/runtime");
const locutusTrim = require('locutus/php/strings/trim');
const ltrim = require('locutus/php/strings/ltrim');
const rtrim = require('locutus/php/strings/rtrim');
/**
 * Returns a trimmed string.
 *
 * @returns {Promise<string>}
 *
 * @throws TwingErrorRuntime When an invalid trimming side is used (not a string or not 'left', 'right', or 'both')
 */
function trim(string, characterMask = null, side = 'both') {
    let _do = () => {
        if (characterMask === null) {
            characterMask = " \t\n\r\0\x0B";
        }
        switch (side) {
            case 'both':
                return locutusTrim(string, characterMask);
            case 'left':
                return ltrim(string, characterMask);
            case 'right':
                return rtrim(string, characterMask);
            default:
                throw new runtime_1.TwingErrorRuntime('Trimming side must be "left", "right" or "both".');
        }
    };
    return Promise.resolve(_do());
}
exports.trim = trim;
