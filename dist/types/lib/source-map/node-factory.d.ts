/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import { TwingSource } from "../source";
import { TwingSourceMapNode } from "./node";
import { TwingNodeType } from "../node";
export declare class TwingSourceMapNodeFactory {
    private readonly _type;
    constructor(type: TwingNodeType);
    create(line: number, column: number, source: TwingSource): TwingSourceMapNode;
    get nodeType(): TwingNodeType;
}
