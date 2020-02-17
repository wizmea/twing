/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import { TwingTokenParser } from "../token-parser";
import { TwingNodeType } from "../node";
import { TwingErrorSyntax } from "../error/syntax";
import { TwingNodeExpressionAssignName } from "../node/expression/assign-name";
import { TwingNodeFor } from "../node/for";
import { TokenType } from "twig-lexer";
export class TwingTokenParserFor extends TwingTokenParser {
    parse(token) {
        let line = token.line;
        let column = token.column;
        let stream = this.parser.getStream();
        let targets = this.parser.parseAssignmentExpression();
        stream.expect(TokenType.OPERATOR, 'in');
        let seq = this.parser.parseExpression();
        let ifExpr = null;
        if (stream.nextIf(TokenType.NAME, 'if')) {
            console.warn(`Using an "if" condition on "for" tag in "${stream.getSourceContext().getName()}" at line ${line} is deprecated since Twig 2.10.0, use a "filter" filter or an "if" condition inside the "for" body instead (if your condition depends on a variable updated inside the loop).`);
            ifExpr = this.parser.parseExpression();
        }
        stream.expect(TokenType.TAG_END);
        let body = this.parser.subparse([this, this.decideForFork]);
        let elseToken;
        if (stream.next().value == 'else') {
            stream.expect(TokenType.TAG_END);
            elseToken = this.parser.subparse([this, this.decideForEnd], true);
        }
        else {
            elseToken = null;
        }
        stream.expect(TokenType.TAG_END);
        let keyTarget;
        let valueTarget;
        if ((targets.getNodes().size) > 1) {
            keyTarget = targets.getNode(0);
            keyTarget = new TwingNodeExpressionAssignName(keyTarget.getAttribute('name'), keyTarget.getTemplateLine(), keyTarget.getTemplateColumn());
            valueTarget = targets.getNode(1);
            valueTarget = new TwingNodeExpressionAssignName(valueTarget.getAttribute('name'), valueTarget.getTemplateLine(), valueTarget.getTemplateColumn());
        }
        else {
            keyTarget = new TwingNodeExpressionAssignName('_key', line, column);
            valueTarget = targets.getNode(0);
            valueTarget = new TwingNodeExpressionAssignName(valueTarget.getAttribute('name'), valueTarget.getTemplateLine(), valueTarget.getTemplateColumn());
        }
        if (ifExpr) {
            this.checkLoopUsageCondition(stream, ifExpr);
            this.checkLoopUsageBody(stream, body);
        }
        return new TwingNodeFor(keyTarget, valueTarget, seq, ifExpr, body, elseToken, line, column, this.getTag());
    }
    decideForFork(token) {
        return token.test(TokenType.NAME, ['else', 'endfor']);
    }
    decideForEnd(token) {
        return token.test(TokenType.NAME, 'endfor');
    }
    // the loop variable cannot be used in the condition
    checkLoopUsageCondition(stream, node) {
        let self = this;
        if ((node.getType() === TwingNodeType.EXPRESSION_GET_ATTR) && (node.getNode('node').getType() === TwingNodeType.EXPRESSION_NAME) && (node.getNode('node').getAttribute('name') === 'loop')) {
            throw new TwingErrorSyntax('The "loop" variable cannot be used in a looping condition.', node.getTemplateLine(), stream.getSourceContext());
        }
        node.getNodes().forEach(function (n) {
            self.checkLoopUsageCondition(stream, n);
        });
    }
    // check usage of non-defined loop-items
    getTag() {
        return 'for';
    }
    // it does not catch all problems (for instance when a for is included into another or when the variable is used in an include)
    checkLoopUsageBody(stream, node) {
        if ((node.getType() === TwingNodeType.EXPRESSION_GET_ATTR) && (node.getNode('node').getType() === TwingNodeType.EXPRESSION_NAME) && (node.getNode('node').getAttribute('name') === 'loop')) {
            let attribute = node.getNode('attribute');
            if ((attribute.getType() === TwingNodeType.EXPRESSION_CONSTANT) && (['length', 'revindex0', 'revindex', 'last'].indexOf(attribute.getAttribute('value')) > -1)) {
                throw new TwingErrorSyntax(`The "loop.${attribute.getAttribute('value')}" variable is not defined when looping with a condition.`, node.getTemplateLine(), stream.getSourceContext());
            }
        }
        // should check for parent.loop.XXX usage
        if (node.getType() === TwingNodeType.FOR) {
            return;
        }
        for (let [k, n] of node.getNodes()) {
            this.checkLoopUsageBody(stream, n);
        }
    }
}
