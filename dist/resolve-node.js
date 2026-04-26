import { spawn } from "node:child_process";
import { dirname } from "node:path";
/**
 * Prints the absolute path to the Node binary for the given npm `node@` spec.
 */
function npxCmd() {
    return process.platform === "win32" ? "npx.cmd" : "npx";
}
export function resolveNodeExecPath(versionSpec, cwd) {
    return new Promise((resolve, reject) => {
        const win32 = process.platform === "win32";
        const child = spawn(npxCmd(), [
            "--yes",
            "--package",
            `node@${versionSpec}`,
            "--",
            "node",
            "-e",
            "process.stdout.write(process.execPath)",
        ], { cwd, stdio: ["ignore", "pipe", "pipe"], shell: win32 });
        let out = "";
        let err = "";
        child.stdout?.on("data", (c) => {
            out += String(c);
        });
        child.stderr?.on("data", (c) => {
            err += String(c);
        });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Could not resolve node@${versionSpec}: ${err || `exit ${code}`}`));
                return;
            }
            const p = out.trim();
            if (!p) {
                reject(new Error(`Empty path from node@${versionSpec}`));
                return;
            }
            resolve(p);
        });
    });
}
export function prependDirToPath(dir, pathEnv) {
    const sep = process.platform === "win32" ? ";" : ":";
    const base = pathEnv ?? "";
    return base ? `${dir}${sep}${base}` : dir;
}
export function nodeBinDir(execPath) {
    return dirname(execPath);
}
//# sourceMappingURL=resolve-node.js.map