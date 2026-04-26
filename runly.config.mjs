export default {
  versions: ["18", "20", "22"],
  bail: false,
  run: {
    argv: ["node", "--test", "test/smoke.test.js"],
    shell: false,
  },
};
