"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unary_1 = require("../unary");
const node_1 = require("../../../node");
class TwingNodeExpressionUnaryNeg extends unary_1.TwingNodeExpressionUnary {
    constructor(expr, lineno, columno) {
        super(expr, lineno, columno);
        this.type = node_1.TwingNodeType.EXPRESSION_UNARY_NEG;
    }
    operator(compiler) {
        return compiler.raw('-');
    }
}
exports.TwingNodeExpressionUnaryNeg = TwingNodeExpressionUnaryNeg;
