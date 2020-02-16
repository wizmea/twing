"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TwingSource {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    getCode() {
        return this.code;
    }
    getName() {
        return this.name;
    }
}
exports.TwingSource = TwingSource;
