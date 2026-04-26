import { spawn } from "node:child_process";
import { nodeBinDir, prependDirToPath, resolveNodeExecPath } from "./resolve-node.js";
function normalizeRun(run) {
    if (typeof run === "string") {
        return { argv: [run], shell: true };
    }
    return { argv: run.argv, shell: run.shell ?? false };
}
export async function runMatrix(config) {
    const cwd = config.cwd ?? process.cwd();
    const results = [];
    const { argv, shell } = normalizeRun(config.run);
    for (const version of config.versions) {
        process.stdout.write(`\n━━━ Node ${version} ━━━\n`);
        let execPath;
        try {
            execPath = await resolveNodeExecPath(version, cwd);
        }
        catch (e) {
            console.error(e instanceof Error ? e.message : e);
            results.push({ version, ok: false, exitCode: null });
            if (config.bail)
                break;
            continue;
        }
        const binDir = nodeBinDir(execPath);
        const pathEnv = prependDirToPath(binDir, process.env.PATH);
        const env = { ...process.env, ...config.env, PATH: pathEnv };
        const code = await new Promise((resolve, reject) => {
            const child = spawn(argv[0], argv.slice(1), {
                cwd,
                env,
                stdio: "inherit",
                shell,
            });
            child.on("error", reject);
            child.on("close", (c) => resolve(c));
        });
        const ok = code === 0;
        results.push({ version, ok, exitCode: code });
        if (!ok && config.bail)
            break;
    }
    return results;
}
//# sourceMappingURL=run-matrix.js.map