"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function iteratorToArray(value, useKeys = false) {
    if (Array.isArray(value)) {
        return value;
    }
    else {
        let result = [];
        if (value.entries) {
            for (let entry of value.entries()) {
                result.push(entry[1]);
            }
        }
        else if (typeof value[Symbol.iterator] === 'function') {
            for (let entry of value) {
                result.push(entry);
            }
        }
        else if (typeof value['next'] === 'function') {
            let i = 0;
            let next;
            while ((next = value.next()) && !next.done) {
                result.push(next.value);
            }
        }
        else {
            for (let k in value) {
                result.push(value[k]);
            }
        }
        return result;
    }
}
exports.iteratorToArray = iteratorToArray;
