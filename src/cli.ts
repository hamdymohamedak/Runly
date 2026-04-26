#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveRunlyConfigPathOrThrow } from "./config-paths.js";
import { initRunlyProject } from "./init.js";
import { runMatrix } from "./run-matrix.js";
import type { RunlyConfig } from "./types.js";

async function loadConfig(configPath: string): Promise<RunlyConfig> {
  const abs = resolve(configPath);
  const mod = (await import(pathToFileURL(abs).href)) as { default?: RunlyConfig };
  const c = mod.default ?? (mod as unknown as RunlyConfig);
  if (!c?.versions?.length) {
    throw new Error("Config must export `versions` (non-empty array)");
  }
  if (!c.run) {
    throw new Error("Config must export `run` (command to execute per version)");
  }
  return c;
}

function printHelp(): void {
  console.error(`Runly — run one command per Node version (matrix)

Usage:
  runly                  Load config from cwd and run the matrix
  runly init             Create runly.config.js and add npm script "runly"
  runly -c <file>        Use a specific config file

Examples:
  npx runly init
  npm run runly

Docs: https://github.com/hamdymohamedak/Runly`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  if (args[0] === "init") {
    const r = initRunlyProject(process.cwd());
    if (r === "exists") {
      console.error("A Runly config already exists (runly.config.mjs, .js, or .cjs). Nothing to do.");
      process.exit(0);
    }
    console.error(
      "Created runly.config.js with default matrix, SKILL.md (if missing), and npm script \"runly\" if package.json is present.",
    );
    process.exit(0);
  }

  const configFlag = args.findIndex((a) => a === "-c" || a === "--config");
  let explicit: string | undefined;
  if (configFlag >= 0 && args[configFlag + 1]) {
    explicit = args[configFlag + 1];
  }

  const configPath = resolveRunlyConfigPathOrThrow(process.cwd(), explicit);
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
