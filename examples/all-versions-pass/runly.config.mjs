/**
 * CI-friendly Runly config: every matrix row exits 0.
 * Proves npx resolution + spawn + PATH on each OS.
 */
export default {
  versions: ["18", "20", "22"],
  bail: false,
  run: {
    argv: ["node", "-e", "console.log('runly ok', process.version)"],
    shell: false,
  },
};
