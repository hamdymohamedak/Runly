/**
 * `node:sqlite` (`DatabaseSync`) ships in Node.js 22.5.0+.
 * On Node 18 / 20 this file fails to load → non-zero exit → Runly shows the mismatch.
 */
import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";

test("opens in-memory DB", () => {
  const db = new DatabaseSync(":memory:");
  assert.ok(db);
});
