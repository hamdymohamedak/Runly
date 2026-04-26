# Runly

Runly is a small CLI and config helper that **runs the same command once per requested Node.js version**, with each run using that version’s `node` binary first on `PATH`. You define versions and the command in a single config file; Runly resolves each runtime via the official [`node`](https://www.npmjs.com/package/node) package through `npx`, so contributors and CI do not need a global version manager (nvm, fnm, asdf, and similar) installed to reproduce the matrix.

---

## What you get

- **Runtime matrix**: Same project, multiple Node lines—useful when you support more than one LTS or need to catch version-specific behavior.
- **One config file**: Versions and the command to run live next to your repo; no per-machine Node layout to document beyond “install Node 18+ and npm”.
- **Real binaries**: Each row uses an actual `node` executable for that spec (resolved with `npx --yes --package node@<spec>`), not a static compatibility guess.
- **Clear output**: Stdio is inherited; each version is announced with a short banner so logs stay readable.

---

## Requirements

- **Node.js** ≥ 18 (for the Runly CLI process).
- **npm** with **npx** available. First-time resolution of a version may download packages; later runs reuse caches when possible.

---

## Installation

```bash
npm install -D @hamdymohamedak/runly
```

The executable name is **`runly`** (see `bin` in `package.json`).

From the directory that contains your config:

```bash
npx runly
```

Without adding a dev dependency:

```bash
npx @hamdymohamedak/runly
```

---

## Configuration file

Runly looks for a config in the **current working directory**, in this order:

1. `runly.config.mjs`
2. `runly.config.js`
3. `runly.config.cjs`

Override the path with `-c` / `--config` (see [CLI](#cli)).

The file must export a **default** object (or be the config object when loaded). The CLI loads JavaScript configs only. To use TypeScript for the config file itself, you would need to run through a loader you provide; Runly does not bundle one.

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `versions` | `string[]` | Yes | Non-empty list of Node version specs accepted by the npm `node` package (for example `"20"`, `"20.10.0"`, `"lts/*"`). Each entry is passed as `node@<spec>` when resolving the binary. |
| `run` | `string` \| `{ argv: string[]; shell?: boolean }` | Yes | Command executed once per version. A **string** runs with `shell: true` (one line, shell parsing). An **object** with `argv` uses `child_process.spawn`; `shell` defaults to `false` unless you set `shell: true`. |
| `cwd` | `string` | No | Working directory for every child. Default: Runly’s current working directory (usually your project root). |
| `bail` | `boolean` | No | If `true`, stop after the first failing version. Default: `false` (run all versions and report all results). |
| `env` | `object` | No | Extra environment variables merged into each child (on top of `process.env`). `PATH` is rewritten per run so the matrix `node` comes first. |

### Example: built-in test runner

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

### Example: npm script (shell)

```javascript
export default {
  versions: ["18", "20", "22"],
  run: "npm test",
};
```

With string / shell `run`, whichever `node` your script and dependencies pick up depends on how `npm` and your scripts are written. For **strict** control over the interpreter, prefer an `argv` array whose first element is `node` (so the prepended `PATH` applies directly).

### Example: explicit `node` + project script

```javascript
export default {
  versions: ["20", "22"],
  run: {
    argv: ["node", "./scripts/run-tests.mjs"],
    shell: false,
  },
};
```

### TypeScript helper (`defineConfig`)

If you depend on Runly as a package, you can get typing and a conventional helper:

```javascript
import { defineConfig } from "@hamdymohamedak/runly";

export default defineConfig({
  versions: ["18", "20", "22"],
  run: "npm test",
});
```

Exported types include `RunlyConfig` and `RunlyRun` for use in your own tooling.

---

## CLI

| Flag | Description |
|------|-------------|
| `-c`, `--config` | Path to a config file. If omitted, Runly searches for `runly.config.mjs`, then `.js`, then `.cjs` in the current working directory. |

---

## Exit codes and errors

- **0**: Every configured version completed with exit code `0`.
- **1**: At least one version failed, or Runly could not resolve a version / load config / run the matrix.

On failure, Runly prints a short summary listing failed version specs.

---

## How Runly runs one version (internals)

1. For each string in `versions`, Runly invokes `npx` with `--yes --package node@<spec>` and a small `node -e` snippet that prints `process.execPath`, obtaining an absolute path to that Node build.
2. It prepends the directory containing that executable to `PATH` for the child process.
3. It spawns your `run` command with `stdio: "inherit"` so output matches a normal local run, with a banner line before each version.

On Windows, `npx.cmd` is used for the resolution step.

---

## Continuous integration

Install dependencies as usual, ensure Node and npm are available, then invoke `npx runly` (or `npx @hamdymohamedak/runly`) from the repository root where the config lives. No extra global Node switcher is required on the runner image as long as `npx` can fetch the `node` package.

---

## Limitations

- **Network**: Resolving a version for the first time may require network access for `npx` / npm.
- **Windows**: Resolution uses `npx.cmd`; spawned commands follow Node’s usual Windows behavior.
- **Config formats**: `.mjs`, `.js`, and `.cjs` only unless you supply your own loading path.

---

## License

This project is released under the [MIT License](./LICENSE).

---

## Links

- **npm package**: [https://www.npmjs.com/package/@hamdymohamedak/runly](https://www.npmjs.com/package/@hamdymohamedak/runly)
- **Repository**: [https://github.com/hamdymohamedak/Runly](https://github.com/hamdymohamedak/Runly)

Node.js is a trademark of the OpenJS Foundation. This project is not affiliated with or endorsed by them.
