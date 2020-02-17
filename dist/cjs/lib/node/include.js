"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../node");
class TwingNodeInclude extends node_1.TwingNode {
    constructor(expr, variables, only, ignoreMissing, lineno, columnno, tag = null) {
        let nodes = new Map();
        if (expr) {
            nodes.set('expr', expr);
        }
        if (variables !== null) {
            nodes.set('variables', variables);
        }
        super(nodes, new Map([['only', only], ['ignore_missing', ignoreMissing]]), lineno, columnno, tag);
        this.type = node_1.TwingNodeType.INCLUDE;
    }
    compile(compiler) {
        compiler
            .write('this.echo(await this.include(context, this.getSourceContext(), ');
        this.addGetTemplate(compiler);
        compiler.raw(', ');
        if (this.hasNode('variables')) {
            compiler.subcompile(this.getNode('variables'));
        }
        else {
            compiler.repr(undefined);
        }
        compiler
            .raw(', ')
            .repr(!this.getAttribute('only'))
            .raw(', ')
            .repr(this.getAttribute('ignore_missing'))
            .raw(', ')
            .repr(this.getTemplateLine())
            .raw(')')
            .raw(');\n');
    }
    addGetTemplate(compiler) {
        compiler.subcompile(this.getNode('expr'));
    }
}
exports.TwingNodeInclude = TwingNodeInclude;
