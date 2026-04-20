import test from "node:test";
import assert from "node:assert/strict";

import { getSafeSetCount, getSetGridTemplate } from "../src/lib/session-layout.ts";

test("getSafeSetCount mantiene las series entre 1 y 5", () => {
  assert.equal(getSafeSetCount(0), 1);
  assert.equal(getSafeSetCount(3), 3);
  assert.equal(getSafeSetCount(7), 5);
});

test("getSetGridTemplate devuelve una rejilla adaptable y sin anchos fijos peligrosos", () => {
  assert.equal(getSetGridTemplate(1), "repeat(1, minmax(0, 1fr))");
  assert.equal(getSetGridTemplate(3), "repeat(3, minmax(0, 1fr))");
  assert.equal(getSetGridTemplate(8), "repeat(5, minmax(0, 1fr))");
});
