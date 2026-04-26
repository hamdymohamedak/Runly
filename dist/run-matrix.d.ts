import type { VintestConfig } from "./types.js";
export interface MatrixResult {
    version: string;
    ok: boolean;
    exitCode: number | null;
}
export declare function runMatrix(config: VintestConfig): Promise<MatrixResult[]>;
//# sourceMappingURL=run-matrix.d.ts.map