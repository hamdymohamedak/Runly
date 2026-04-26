import type { VintestConfig } from "./types.js";

export type { VintestConfig, VintestRun } from "./types.js";

export function defineConfig(config: VintestConfig): VintestConfig {
  return config;
}
