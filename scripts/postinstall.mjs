import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = "@hamdymohamedak/runly";
const CONFIG_CANDIDATES = ["runly.config.mjs", "runly.config.js", "runly.config.cjs"];

function isInsideNodeModules(dir) {
  return dir.split(sep).includes("node_modules");
}

function installContextRoot() {
  const init = process.env.INIT_CWD;
  if (init) return init;
  const cwd = process.cwd();
  if (isInsideNodeModules(cwd)) return null;
  return cwd;
}

function readPkg(dir) {
  const p = join(dir, "package.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function declaresRunly(pkg) {
  if (!pkg || typeof pkg !== "object") return false;
  const blocks = [
    pkg.dependencies,
    pkg.devDependencies,
    pkg.optionalDependencies,
    pkg.peerDependencies,
  ];
  for (const b of blocks) {
    if (b && typeof b === "object" && PKG in b) return true;
  }
  return false;
}

/** First directory from `start` upward whose package.json lists this package. */
function findConsumerRoot(start) {
  let dir = start;
  for (;;) {
    const pkg = readPkg(dir);
    if (pkg && declaresRunly(pkg)) return { dir, pkg };
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function hasRunlyConfig(projectRoot) {
  return CONFIG_CANDIDATES.some((name) => existsSync(join(projectRoot, name)));
}

function defaultConfigBody() {
  // One-liner so first `npm run runly` succeeds without a test/ tree; users can switch to `node --test` etc.
  return `{
  versions: ["18", "20", "22"],
  bail: false,
  run: {
    argv: ["node", "-e", "console.log('runly ok', process.version)"],
    shell: false,
  },
}`;
}

function writePackageJson(projectRoot, pkg) {
  const pkgPath = join(projectRoot, "package.json");
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

/** Ensures `scripts.runly` so `npm run runly` works. Returns true if package.json was written. */
function ensureRunlyNpmScript(pkg) {
  const prev = pkg.scripts;
  const scripts =
    prev != null && typeof prev === "object" && !Array.isArray(prev)
      ? { ...prev }
      : {};
  if (Object.hasOwn(scripts, "runly")) return false;
  scripts.runly = "runly";
  pkg.scripts = scripts;
  return true;
}

function main() {
  if (process.env.RUNLY_SKIP_POSTINSTALL === "1" || process.env.RUNLY_SKIP_POSTINSTALL === "true") {
    return;
  }
  if (process.env.npm_config_global === "true") {
    return;
  }

  const start = installContextRoot();
  if (!start) return;

  const found = findConsumerRoot(start);
  if (!found) return;

  const { dir: projectRoot, pkg } = found;

  if (!hasRunlyConfig(projectRoot)) {
    const isEsm = pkg.type === "module";
    const body = defaultConfigBody();
    const content = isEsm
      ? `/** @type {import("${PKG}").RunlyConfig} */\nexport default ${body};\n`
      : `/** @type {import("${PKG}").RunlyConfig} */\nmodule.exports = ${body};\n`;

    writeFileSync(join(projectRoot, "runly.config.js"), content, "utf8");
  }

  if (ensureRunlyNpmScript(pkg)) {
    writePackageJson(projectRoot, pkg);
  }
}

main();
