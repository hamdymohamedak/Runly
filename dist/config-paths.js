import { existsSync } from "node:fs";
import { resolve } from "node:path";
export const RUNLY_CONFIG_CANDIDATES = ["runly.config.mjs", "runly.config.js", "runly.config.cjs"];
export function hasAnyRunlyConfig(cwd) {
    for (const name of RUNLY_CONFIG_CANDIDATES) {
        if (existsSync(resolve(cwd, name)))
            return true;
    }
    return false;
}
/** Resolved path to an existing config, or `null`. */
export function findRunlyConfigPath(cwd) {
    for (const name of RUNLY_CONFIG_CANDIDATES) {
        const p = resolve(cwd, name);
        if (existsSync(p))
            return p;
    }
    return null;
}
export function resolveRunlyConfigPathOrThrow(cwd, explicit) {
    if (explicit)
        return resolve(explicit);
    const found = findRunlyConfigPath(cwd);
    if (found)
        return found;
    throw new Error(`No Runly config found. Run: npx runly init (or create ${RUNLY_CONFIG_CANDIDATES.join(", ")})`);
}
//# sourceMappingURL=config-paths.js.map