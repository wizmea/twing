"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../node");
class TwingNodeIf extends node_1.TwingNode {
    constructor(tests, elseNode, lineno, columnno, tag = null) {
        let nodes = new Map();
        nodes.set('tests', tests);
        if (elseNode) {
            nodes.set('else', elseNode);
        }
        super(nodes, new Map(), lineno, columnno, tag);
        this.type = node_1.TwingNodeType.IF;
    }
    compile(compiler) {
        let count = this.getNode('tests').getNodes().size;
        for (let i = 0; i < count; i += 2) {
            if (i > 0) {
                compiler
                    .outdent()
                    .write('}\n')
                    .write('else if (');
            }
            else {
                compiler
                    .write('if (');
            }
            compiler
                .subcompile(this.getNode('tests').getNode(i))
                .raw(") {\n")
                .indent()
                .subcompile(this.getNode('tests').getNode(i + 1));
        }
        if (this.hasNode('else')) {
            compiler
                .outdent()
                .write("}\n")
                .write("else {\n")
                .indent()
                .subcompile(this.getNode('else'));
        }
        compiler
            .outdent()
            .write("}\n");
    }
}
exports.TwingNodeIf = TwingNodeIf;
