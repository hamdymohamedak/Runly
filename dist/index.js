import { pathToFileURL } from "node:url";
import { findRunlyConfigPath, hasAnyRunlyConfig, RUNLY_CONFIG_CANDIDATES } from "./config-paths.js";
import { initRunlyProject } from "./init.js";
export { RUNLY_CONFIG_CANDIDATES, findRunlyConfigPath, hasAnyRunlyConfig, initRunlyProject };
export function defineConfig(config) {
    return config;
}
/**
 * Load the first existing Runly config in `cwd` (same discovery order as the CLI).
 * @throws If no config file exists — run `npx runly init` or create a config manually.
 */
export async function loadConfig(cwd = process.cwd()) {
    const path = findRunlyConfigPath(cwd);
    if (!path) {
        throw new Error(`No Runly config found in ${cwd}. Run: npx runly init`);
    }
    const mod = (await import(pathToFileURL(path).href));
    const c = mod.default ?? mod;
    if (!c?.versions?.length) {
        throw new Error("Config must export `versions` (non-empty array)");
    }
    if (!c.run) {
        throw new Error("Config must export `run` (command to execute per version)");
    }
    return c;
}
//# sourceMappingURL=index.js.map