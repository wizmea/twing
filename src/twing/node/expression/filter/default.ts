import {TwingNodeExpressionFilter} from "../filter";
import {TwingNode, TwingNodeType} from "../../../node";
import {TwingNodeExpressionConstant} from "../constant";
import {TwingNodeExpressionTestDefined} from "../test/defined";
import {TwingNodeExpressionConditional} from "../conditional";
import {TwingNodeExpression} from "../../expression";
import {TwingCompiler} from "../../../compiler";

export class TwingNodeExpressionFilterDefault extends TwingNodeExpressionFilter {
    constructor(node: TwingNode, filterName: TwingNodeExpressionConstant, methodArguments: TwingNode, lineno: number, tag: string) {
        let defaultNode = new TwingNodeExpressionFilter(node, new TwingNodeExpressionConstant('default', node.getTemplateLine()), methodArguments, node.getTemplateLine());

        if (filterName.getAttribute('value') === 'default' && (node.getType() === TwingNodeType.EXPRESSION_NAME || node.getType() === TwingNodeType.EXPRESSION_GET_ATTR)) {
            let test = new TwingNodeExpressionTestDefined(node.clone() as TwingNodeExpression, 'defined', new TwingNode(), node.getTemplateLine());
            let falseNode = methodArguments.getNodes().size ? methodArguments.getNode(0) : new TwingNodeExpressionConstant('', node.getTemplateLine());

            node = new TwingNodeExpressionConditional(test, defaultNode, falseNode as TwingNodeExpression, node.getTemplateLine());
        }
        else {
            node = defaultNode;
        }

        super(node, filterName, methodArguments, lineno, tag);
    }

    compile(compiler: TwingCompiler) {
        compiler.subcompile(this.getNode('node'));
    }
}
