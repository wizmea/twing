"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Marks a section of a template to be escaped or not.
 */
const token_parser_1 = require("../token-parser");
const node_1 = require("../node");
const syntax_1 = require("../error/syntax");
const auto_escape_1 = require("../node/auto-escape");
const twig_lexer_1 = require("twig-lexer");
class TwingTokenParserAutoEscape extends token_parser_1.TwingTokenParser {
    parse(token) {
        let lineno = token.line;
        let columnno = token.column;
        let stream = this.parser.getStream();
        let value;
        if (stream.test(twig_lexer_1.TokenType.TAG_END)) {
            value = 'html';
        }
        else {
            let expr = this.parser.parseExpression();
            if (expr.getType() !== node_1.TwingNodeType.EXPRESSION_CONSTANT) {
                throw new syntax_1.TwingErrorSyntax('An escaping strategy must be a string or false.', stream.getCurrent().line, stream.getSourceContext());
            }
            value = expr.getAttribute('value');
        }
        stream.expect(twig_lexer_1.TokenType.TAG_END);
        let body = this.parser.subparse([this, this.decideBlockEnd], true);
        stream.expect(twig_lexer_1.TokenType.TAG_END);
        return new auto_escape_1.TwingNodeAutoEscape(value, body, lineno, columnno, this.getTag());
    }
    decideBlockEnd(token) {
        return token.test(twig_lexer_1.TokenType.NAME, 'endautoescape');
    }
    getTag() {
        return 'autoescape';
    }
}
exports.TwingTokenParserAutoEscape = TwingTokenParserAutoEscape;
