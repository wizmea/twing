import { TwingTokenParser } from "../token-parser";
import { TwingNodeExpressionAssignName } from "../node/expression/assign-name";
import { TwingNodeImport } from "../node/import";
import { TokenType } from "twig-lexer";
export class TwingTokenParserImport extends TwingTokenParser {
    parse(token) {
        let macro = this.parser.parseExpression();
        this.parser.getStream().expect(TokenType.NAME, 'as');
        // template alias
        let var_ = new TwingNodeExpressionAssignName(this.parser.getStream().expect(TokenType.NAME).value, token.line, token.column);
        this.parser.getStream().expect(TokenType.TAG_END);
        this.parser.addImportedSymbol('template', var_.getAttribute('name'));
        return new TwingNodeImport(macro, var_, token.line, token.column, this.getTag(), this.parser.isMainScope());
    }
    getTag() {
        return 'import';
    }
}
