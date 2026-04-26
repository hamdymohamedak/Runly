#!/usr/bin/env node
/**
 * CI: pack this repo, install tarball into fresh consumers, run `runly init`, assert
 * runly.config.js + SKILL.md + scripts.runly, then `npm run runly`.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PKG = "@hamdymohamedak/runly";
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
process.chdir(repoRoot);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const version = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).version;
const packDir = mkdtempSync(join(tmpdir(), "runly-pack-"));
run("npm", ["pack", "--pack-destination", packDir, "--ignore-scripts"]);
const tgz = join(packDir, `hamdymohamedak-runly-${version}.tgz`);
if (!existsSync(tgz)) {
  console.error("ci-verify-init: tarball missing:", tgz);
  process.exit(1);
}

function verifyConsumer(label, pkgJson, assertConfig) {
  const consumer = mkdtempSync(join(tmpdir(), `runly-consumer-${label}-`));
  const body = {
    ...pkgJson,
    dependencies: {
      ...(pkgJson.dependencies && typeof pkgJson.dependencies === "object" ? pkgJson.dependencies : {}),
      [PKG]: pathToFileURL(tgz).href,
    },
  };
  writeFileSync(join(consumer, "package.json"), `${JSON.stringify(body, null, 2)}\n`);
  run("npm", ["install", "--no-fund", "--no-audit"], { cwd: consumer });

  run("npx", ["runly", "init"], { cwd: consumer });

  const cfg = join(consumer, "runly.config.js");
  if (!existsSync(cfg)) {
    console.error(`[${label}] missing runly.config.js after runly init`);
    process.exit(1);
  }
  assertConfig(readFileSync(cfg, "utf8"));

  const skill = join(consumer, "SKILL.md");
  if (!existsSync(skill)) {
    console.error(`[${label}] missing SKILL.md after runly init`);
    process.exit(1);
  }
  if (!readFileSync(skill, "utf8").includes("name: runly")) {
    console.error(`[${label}] SKILL.md looks invalid`);
    process.exit(1);
  }

  const installed = JSON.parse(readFileSync(join(consumer, "package.json"), "utf8"));
  if (installed.scripts?.runly !== "runly") {
    console.error(`[${label}] expected scripts.runly === "runly", got:`, installed.scripts);
    process.exit(1);
  }

  run("npm", ["run", "runly"], { cwd: consumer });
  console.error(`[${label}] runly init + matrix: OK`);
}

verifyConsumer(
  "cjs",
  {
    name: "init-ci-cjs",
    version: "1.0.0",
    private: true,
    type: "commonjs",
  },
  (text) => {
    if (!text.includes("module.exports")) {
      console.error("[cjs] expected module.exports in runly.config.js");
      process.exit(1);
    }
  },
);

verifyConsumer(
  "esm",
  {
    name: "init-ci-esm",
    version: "1.0.0",
    private: true,
    type: "module",
  },
  (text) => {
    if (!text.includes("export default")) {
      console.error("[esm] expected export default in runly.config.js");
      process.exit(1);
    }
  },
);

console.error("ci-verify-init: all checks passed");
