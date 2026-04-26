import { test } from "node:test";
import assert from "node:assert";

test("runtime is node", () => {
  assert.ok(process.versions.node);
});
