"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binary_1 = require("../binary");
class TwingNodeExpressionBinaryEndsWith extends binary_1.TwingNodeExpressionBinary {
    compile(compiler) {
        compiler
            .raw('await (async () => {')
            .raw(`let left = `)
            .subcompile(this.getNode('left'))
            .raw('; ')
            .raw(`let right = `)
            .subcompile(this.getNode('right'))
            .raw('; ')
            .raw(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.endsWith(right));`)
            .raw('})()');
    }
}
exports.TwingNodeExpressionBinaryEndsWith = TwingNodeExpressionBinaryEndsWith;
