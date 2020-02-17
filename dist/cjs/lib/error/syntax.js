"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../error");
const Levenshtein = require('levenshtein');
class TwingErrorSyntax extends error_1.TwingError {
    constructor(message, lineno = -1, source = null, previous) {
        super(message, lineno, source, previous);
        this.name = 'TwingErrorSyntax';
    }
    /**
     * Tweaks the error message to include suggestions.
     *
     * @param {string} name The original name of the item that does not exist
     * @param {Array<string>} items An array of possible items
     */
    addSuggestions(name, items) {
        let alternatives = [];
        let levenshtein = new Levenshtein();
        items.forEach(function (item) {
            levenshtein = new Levenshtein(name, item);
            if (levenshtein.distance <= (name.length / 3) || item.indexOf(name) > -1) {
                alternatives.push(item);
            }
        });
        if (alternatives.length < 1) {
            return;
        }
        alternatives.sort();
        this.appendMessage(` Did you mean "${alternatives.join(', ')}"?`);
    }
}
exports.TwingErrorSyntax = TwingErrorSyntax;
