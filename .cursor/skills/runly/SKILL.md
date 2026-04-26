---
name: runly
description: >-
  Runs the same Node.js command under multiple Node versions from one config file
  (runly.config.mjs/js/cjs), resolving each runtime via npx and the npm `node`
  package. Use `runly init` to scaffold config and npm script; use `loadConfig()` in code.
  Use when the user mentions Runly, @hamdymohamedak/runly, multi-version Node testing,
  Node matrix in CI, runly.config, or running tests across Node 18/20/22.
---

# Runly

## What it is

- **npm package**: `@hamdymohamedak/runly` (scoped; unscoped name `runly` is blocked on npm as too similar to `runjs`).
- **CLI binary name**: `runly` — use **`npx runly init`** once to create config + **`npm run runly`**, or **`npx runly`** for one-off runs.
- **Purpose**: For each entry in `versions`, resolve a real `node` binary for that spec, prepend its directory to `PATH`, then spawn the configured command so that command’s default `node` is that matrix version—without requiring nvm/fnm/asdf on the machine.

## Requirements

- Node **≥ 18** for the Runly CLI process.
- **npm** with **npx** (first-time version resolution may hit the network).

## Install

```bash
npm install -D @hamdymohamedak/runly
```

One-off without saving to `package.json`:

```bash
npx @hamdymohamedak/runly
npx @hamdymohamedak/runly init
```

## `runly init` (scaffold)

From the **project root** (after **`npm install -D @hamdymohamedak/runly`**):

```bash
npx runly init
```

- Creates **`runly.config.js`** only if none of **`runly.config.mjs`**, **`runly.config.js`**, or **`runly.config.cjs`** exists (otherwise prints a message and exits **0**).
- Writes **`SKILL.md`** in the project root when missing (Cursor agent skill template from the package); you may move it to **`.cursor/skills/runly/SKILL.md`**.
- Uses **`export default`** when **`package.json`** has **`"type": "module"`**, else **`module.exports`**.
- Adds **`"runly": "runly"`** under **`scripts`** in **`package.json`** when the file exists and **`scripts.runly`** is not already set.
- Default **`run`** in the scaffold is a small **`node -e`** smoke command; edit to **`node --test`**, **`npm test`**, etc.

Programmatic: **`initRunlyProject(cwd)`** from **`@hamdymohamedak/runly`**.

## Config file discovery

From **current working directory**, first file that exists:

1. `runly.config.mjs`
2. `runly.config.js`
3. `runly.config.cjs`

Override: `runly -c /path/to/config.mjs` or `runly --config /path/to/runly.config.mjs`.

Config must be **JavaScript** (ESM or CJS). Runly does **not** load `.ts` configs unless the user wires a loader themselves. Export **`default`** as the config object (or the module’s default export after dynamic `import()`).

## Config shape (`RunlyConfig`)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `versions` | `string[]` | Yes | Non-empty. Each string is an npm **`node`** package spec (e.g. `"20"`, `"20.10.0"`, `"lts/*"`). Passed as `node@<spec>` when resolving. |
| `run` | `RunlyRun` | Yes | See below. |
| `cwd` | `string` | No | Child `cwd`; default Runly’s `process.cwd()`. |
| `bail` | `boolean` | No | If `true`, stop after first failing version. Default `false`. |
| `env` | `NodeJS.ProcessEnv` | No | Merged into child env; `PATH` is overridden per row so matrix `node` is first. |

### `RunlyRun`

- **String**: treated as one shell command → `spawn` with **`shell: true`** (single string in argv).
- **`{ argv: string[]; shell?: boolean }`**: `spawn(argv[0], argv.slice(1), { shell, stdio: 'inherit' })`. Default **`shell: false`** for array form.

**Guidance**: For predictable use of the matrix Node, prefer **`argv`** whose first token is **`node`** (e.g. `["node", "--test", "test/"]`). String form like `"npm test"` depends on how npm/scripts resolve `node`.

## Minimal examples

```javascript
// runly.config.mjs
export default {
  versions: ["18", "20", "22"],
  bail: false,
  run: {
    argv: ["node", "--test", "test/"],
    shell: false,
  },
};
```

```javascript
export default {
  versions: ["20", "22"],
  run: "npm test",
};
```

## TypeScript / IDE helper

From the same package (public export `"."` only):

```javascript
import { defineConfig } from "@hamdymohamedak/runly";

export default defineConfig({
  versions: ["18", "20", "22"],
  run: { argv: ["node", "--test", "test/"], shell: false },
});
```

Exported types: **`RunlyConfig`**, **`RunlyRun`**. **`loadConfig(cwd?)`** loads the default config or throws with a hint to run **`npx runly init`**. The matrix runner **`runMatrix`** is not exported—use the CLI or compose from source.

## CLI

| Command / flag | Meaning |
|----------------|---------|
| `runly init` | Scaffold **`runly.config.js`**, **`SKILL.md`** (if missing), and **`scripts.runly`** (see above). |
| `runly` | Run matrix using config in cwd. |
| `-c`, `--config` | Path to config file. |
| `runly help` | Usage. |

## Exit codes

- **0**: every version’s child exited with code `0`.
- **1**: any child non-zero, resolution failure, or config error. stderr includes `Failed: <version list>` when some matrix rows failed.

## Internals (for debugging)

1. Resolve binary: `npx` with `--yes --package node@<versionSpec> -- node -e "process.stdout.write(process.execPath)"` (on Windows: **`npx.cmd`**).
2. `PATH`: prepend `dirname(process.execPath)` for that Node for the child only.
3. Output: banner `━━━ Node <spec> ━━━` per row; child **stdio inherited**.

## CI

Install deps, `cd` to repo root, run **`npx runly init`** once if the repo has no config, then **`npm run runly`** or **`npx runly`**. No global version manager required if `npx` can fetch the `node` package.

## Limitations

- Network may be needed for `npx` / registry on cold caches.
- Windows: `npx.cmd` for resolution; usual Windows spawn/shell rules apply.
- Package **`bin`** in `package.json` must use paths like `dist/cli.js` (no `./` prefix)—npm may strip invalid `bin` entries on publish.

## Reference in this repo

- User-facing docs: [README.md](../../../README.md)
- Example config: [examples/all-versions-pass/runly.config.mjs](../../../examples/all-versions-pass/runly.config.mjs)

## Links

- npm: `https://www.npmjs.com/package/@hamdymohamedak/runly`
- Source: `https://github.com/hamdymohamedak/Runly`
