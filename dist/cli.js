#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runMatrix } from "./run-matrix.js";
const CANDIDATES = ["runly.config.mjs", "runly.config.js", "runly.config.cjs"];
function resolveConfigPath(explicit) {
    if (explicit)
        return resolve(explicit);
    for (const name of CANDIDATES) {
        const p = resolve(process.cwd(), name);
        if (existsSync(p))
            return p;
    }
    throw new Error(`No config found. Create ${CANDIDATES.join(" or ")} or pass -c /path/to/runly.config.mjs`);
}
async function loadConfig(configPath) {
    const abs = resolve(configPath);
    const mod = (await import(pathToFileURL(abs).href));
    const c = mod.default ?? mod;
    if (!c?.versions?.length) {
        throw new Error("Config must export `versions` (non-empty array)");
    }
    if (!c.run) {
        throw new Error("Config must export `run` (command to execute per version)");
    }
    return c;
}
async function main() {
    const args = process.argv.slice(2);
    const configFlag = args.findIndex((a) => a === "-c" || a === "--config");
    let explicit;
    if (configFlag >= 0 && args[configFlag + 1]) {
        explicit = args[configFlag + 1];
    }
    const configPath = resolveConfigPath(explicit);
    const config = await loadConfig(configPath);
    const results = await runMatrix(config);
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
        console.error(`\nFailed: ${failed.map((f) => f.version).join(", ")}`);
        process.exit(1);
    }
    console.error("\nAll Node versions passed.");
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map