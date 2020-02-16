import { TwingNode } from "../node";
import { TwingCompiler } from "../compiler";
import { TwingNodeCaptureInterface } from "../node-capture-interface";
export declare class TwingNodeSet extends TwingNode implements TwingNodeCaptureInterface {
    TwingNodeCaptureInterfaceImpl: TwingNodeCaptureInterface;
    constructor(capture: boolean, names: TwingNode, values: TwingNode, lineno: number, columnno: number, tag?: string);
    compile(compiler: TwingCompiler): void;
}
