import { findRunlyConfigPath, hasAnyRunlyConfig, RUNLY_CONFIG_CANDIDATES } from "./config-paths.js";
import { initRunlyProject } from "./init.js";
import type { RunlyConfig } from "./types.js";
export type { RunlyConfig, RunlyRun } from "./types.js";
export { RUNLY_CONFIG_CANDIDATES, findRunlyConfigPath, hasAnyRunlyConfig, initRunlyProject };
export declare function defineConfig(config: RunlyConfig): RunlyConfig;
/**
 * Load the first existing Runly config in `cwd` (same discovery order as the CLI).
 * @throws If no config file exists — run `npx runly init` or create a config manually.
 */
export declare function loadConfig(cwd?: string): Promise<RunlyConfig>;
//# sourceMappingURL=index.d.ts.map