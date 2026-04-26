import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hasAnyRunlyConfig } from "./config-paths.js";
const PKG = "@hamdymohamedak/runly";
const DEFAULT_FILE = "runly.config.js";
const SKILL_FILE = "SKILL.md";
function readPkgJson(cwd) {
    const p = join(cwd, "package.json");
    if (!existsSync(p))
        return null;
    try {
        return JSON.parse(readFileSync(p, "utf8"));
    }
    catch {
        return null;
    }
}
function defaultConfigBody() {
    return `{
  versions: ["18", "20", "22"],
  bail: false,
  run: {
    argv: ["node", "-e", "console.log('runly ok', process.version)"],
    shell: false,
  },
}`;
function tryAddRunlyScriptToDisk(cwd) {
    const pkgPath = join(cwd, "package.json");
    if (!existsSync(pkgPath))
        return;
    let pkg;
    try {
        pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    }
    catch {
        return;
    }
    const prev = pkg.scripts;
    const scripts = prev != null && typeof prev === "object" && !Array.isArray(prev)
        ? { ...prev }
        : {};
    if (Object.hasOwn(scripts, "runly"))
        return;
    scripts.runly = "runly";
    pkg.scripts = scripts;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
function bundledSkillTemplatePath() {
    const here = dirname(fileURLToPath(import.meta.url));
    const packageRoot = join(here, "..");
    const p = join(packageRoot, "templates", SKILL_FILE);
    return existsSync(p) ? p : null;
}
function tryWriteSkillTemplate(cwd) {
    const target = join(cwd, SKILL_FILE);
    if (existsSync(target))
        return;
    const src = bundledSkillTemplatePath();
    if (!src)
        return;
    try {
        writeFileSync(target, readFileSync(src, "utf8"));
    }
    catch {
        /* ignore */
    }
}
export function initRunlyProject(cwd) {
    if (hasAnyRunlyConfig(cwd))
        return "exists";
    const pkg = readPkgJson(cwd);
    const isEsm = pkg?.type === "module";
    const body = defaultConfigBody();
    const content = isEsm
        ? `/** @type {import("${PKG}").RunlyConfig} */\nexport default ${body};\n`
        : `/** @type {import("${PKG}").RunlyConfig} */\nmodule.exports = ${body};\n`;
    writeFileSync(join(cwd, DEFAULT_FILE), content, "utf8");
    tryWriteSkillTemplate(cwd);
    tryAddRunlyScriptToDisk(cwd);
    return "created";
}
