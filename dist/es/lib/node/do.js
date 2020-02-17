import { TwingNode, TwingNodeType } from "../node";
/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 * @author Eric Morand <eric.morand@gmail.com>
 */
export class TwingNodeDo extends TwingNode {
    constructor(expr, lineno, columnno, tag = null) {
        super(new Map([['expr', expr]]), new Map(), lineno, columnno, tag);
        this.type = TwingNodeType.DO;
    }
    compile(compiler) {
        compiler
            .subcompile(this.getNode('expr'), true)
            .raw(";\n");
    }
}
