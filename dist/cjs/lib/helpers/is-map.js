"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context");
function isMap(candidate) {
    return (candidate instanceof Map || candidate instanceof context_1.TwingContext);
}
exports.isMap = isMap;
