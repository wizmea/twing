import { TwingNodeExpressionBinary } from "../binary";
export class TwingNodeExpressionBinaryEndsWith extends TwingNodeExpressionBinary {
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
