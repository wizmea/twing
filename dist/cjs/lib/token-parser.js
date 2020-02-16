"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for all token parsers.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
class TwingTokenParser {
    constructor() {
        this.TwingTokenParserInterfaceImpl = this;
    }
    setParser(parser) {
        this.parser = parser;
    }
}
exports.TwingTokenParser = TwingTokenParser;
