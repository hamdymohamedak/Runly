import type { RunlyConfig } from "./types.js";

export type { RunlyConfig, RunlyRun } from "./types.js";

export function defineConfig(config: RunlyConfig): RunlyConfig {
  return config;
}
