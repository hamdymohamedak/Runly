# Runly

**Run the same test command under multiple Node.js versions**—similar in spirit to how [Playwright](https://playwright.dev/) runs one suite across multiple browser engines, but for the Node runtime matrix instead.

Runly resolves each requested version via the official [`node`](https://www.npmjs.com/package/node) package (`npx`), prepends that binary to `PATH`, and executes your configured command. You get real runtime behavior per version without maintaining a local `nvm`/`fnm` layout for CI or your team.

---

## Why use this?

- **Catch version-only failures**: APIs, module resolution, and syntax supported in one LTS line may break on another.
- **One config, many runtimes**: Declare versions once; each row runs your tests with that Node first on `PATH`.
- **No global version manager required**: Uses `npx` and the `node@<spec>` pattern so machines only need a recent Node and npm.

---

## Requirements

- **Node.js** ≥ 18 (for running the Runly CLI itself).
- **npm** with **`npx`** available (used to fetch `node@<version>` binaries). First runs may download caches; later runs are faster.

---

## Installation

### From npm

```bash
npm install -D @hamdymohamedak/runly
```

The CLI command is still **`runly`** (see `package.json` `bin`). From your project root, next to `runly.config.mjs`:

```bash
npx runly
```

To run without adding a devDependency:

```bash
npx @hamdymohamedak/runly
```

---

## Quick start

1. Add a config file at the project root (first match wins):

   - `runly.config.mjs`
   - `runly.config.js`
   - `runly.config.cjs`

2. Example `runly.config.mjs`:

   ```javascript
   export default {
     versions: ["18", "20", "22"],
     bail: false,
     run: {
       argv: ["node", "--test", "test/"],
       shell: false,
     },
   };
   ```

3. From the directory that contains the config:

   ```bash
   npx runly
   ```

   Or with an explicit config path:

   ```bash
   npx runly -c ./runly.config.mjs
   ```

Exit code **0** means every version passed; **1** means at least one version failed.

---

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `versions` | `string[]` | **Required.** Node version specs for the `node` npm package (e.g. `"20"`, `"20.10.0"`, `"lts/*"`). |
| `run` | `string` \| `{ argv: string[]; shell?: boolean }` | **Required.** Command executed once per version. String form runs in a shell (`shell: true`). Array form uses `spawn` with optional `shell`. |
| `cwd` | `string` | Working directory for each child. Default: `process.cwd()` of the CLI. |
| `bail` | `boolean` | Stop the matrix after the first failing version. Default: `false`. |
| `env` | `object` | Extra environment variables merged into each run. |

### Recommended `run` patterns

- **Stable control**: point at the test runner with the matrix Node, for example:

  `["node", "./node_modules/vitest/vitest.mjs", "run"]`

- **Shell one-liners**: `run: "npm test"` (uses `shell: true`).

With `npm test`, behavior depends on how scripts invoke `node`; putting the desired `node` first on `PATH` works for typical setups.

### TypeScript helper (optional)

If you consume Runly as a library from compiled output:

```javascript
import { defineConfig } from "@hamdymohamedak/runly";

export default defineConfig({
  versions: ["18", "20", "22"],
  run: "npm test",
});
```

The CLI loads **JavaScript** configs by default. TypeScript configs (`.ts`) are not loaded unless you run Node with a TypeScript loader yourself.

---

## CLI

| Flag | Description |
|------|-------------|
| `-c`, `--config` | Path to a config file. If omitted, Runly looks for `runly.config.mjs`, then `.js`, then `.cjs` in the current working directory. |

---

## Example idea

If your tests rely on a **newer-only** Node API (for example a built-in module), running Runly across `18`, `20`, and `22` will show which lines pass and which fail—without static analysis, by executing the same command under each runtime.

---

## How it works (short)

1. For each entry in `versions`, Runly runs `npx` to resolve the absolute path to that version’s `node` binary.
2. It prepends that binary’s directory to `PATH` for the child process.
3. It spawns your `run` command with inherited stdio so logs look like a normal local test run, prefixed by a banner per version.

---

## Limitations

- **Network**: First resolution of a version may hit the network via `npx`.
- **Windows**: `npx.cmd` is used automatically on Windows for spawning.
- **Config format**: Use `.mjs` / `.js` / `.cjs` unless you bring your own TS loader.

---

## License

This project is released under the [MIT License](./LICENSE).

---

## Acknowledgments

Inspired by the **multi-target** workflow popularized by browser test runners. Node is a trademark of the OpenJS Foundation; this project is not affiliated with or endorsed by them.

---

## More

- **Package on npm**: [npmjs.com/package/@hamdymohamedak/runly](https://www.npmjs.com/package/@hamdymohamedak/runly)
- **Source and issues**: [github.com/hamdymohamedak/Vintest](https://github.com/hamdymohamedak/Vintest)
