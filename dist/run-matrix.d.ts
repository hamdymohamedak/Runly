import type { RunlyConfig } from "./types.js";
export interface MatrixResult {
    version: string;
    ok: boolean;
    exitCode: number | null;
}
export declare function runMatrix(config: RunlyConfig): Promise<MatrixResult[]>;
//# sourceMappingURL=run-matrix.d.ts.map