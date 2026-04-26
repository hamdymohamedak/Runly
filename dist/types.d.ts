export type RunlyRun = string | {
    /** argv passed to the shell or spawn (no implicit shell on Windows for array form) */
    argv: string[];
    /** When true, run argv with `shell: true` (needed for `npm test` style). Default: false for array. */
    shell?: boolean;
};
export interface RunlyConfig {
    /**
     * Node versions to test against (npm `node` dist-tags / semver ranges work, e.g. `20`, `20.10.0`, `lts/*`).
     * Resolved via `npx -y node@<spec>` so no global nvm required.
     */
    versions: string[];
    /**
     * Command run once per version with that version’s `node` first on PATH.
     * Prefer `['node', './node_modules/vitest/vitest.mjs', 'run']` over `npm test` if you need strict control.
     */
    run: RunlyRun;
    /** Working directory for each run. Default: process.cwd() */
    cwd?: string;
    /** Stop after first failure. Default: false */
    bail?: boolean;
    /** Extra env vars merged into each child process */
    env?: NodeJS.ProcessEnv;
}
//# sourceMappingURL=types.d.ts.map