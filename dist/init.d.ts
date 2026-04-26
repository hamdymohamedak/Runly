/**
 * Create `runly.config.js` with defaults, copy `SKILL.md` when absent, and add `"runly": "runly"` to package.json when possible.
 * @returns `"exists"` if any runly config file is already present, otherwise `"created"`.
 */
export declare function initRunlyProject(cwd: string): "exists" | "created";
