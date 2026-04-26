export declare const RUNLY_CONFIG_CANDIDATES: readonly ["runly.config.mjs", "runly.config.js", "runly.config.cjs"];
export declare function hasAnyRunlyConfig(cwd: string): boolean;
/** Resolved path to an existing config, or `null`. */
export declare function findRunlyConfigPath(cwd: string): string | null;
export declare function resolveRunlyConfigPathOrThrow(cwd: string, explicit?: string): string;
//# sourceMappingURL=config-paths.d.ts.map