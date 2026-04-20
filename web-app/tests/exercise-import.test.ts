import test from "node:test";
import assert from "node:assert/strict";

import { buildCatalogFromRows, slugifyExerciseName } from "../src/lib/exercise-import.ts";

test("slugifyExerciseName normaliza acentos, espacios y barras", () => {
  assert.equal(slugifyExerciseName("FEMORAL / ISQUIO"), "femoral-isquio");
  assert.equal(slugifyExerciseName("Press Inclinado"), "press-inclinado");
});

test("buildCatalogFromRows elimina filas incompletas y deduplica ejercicios", () => {
  const catalog = buildCatalogFromRows([
    ["Press Inclinado", "Mancuernas", "mancuerna"],
    ["Press Inclinado", "Mancuernas", "mancuerna"],
    ["", "Mancuernas", "mancuerna"],
    ["Remo", "Polea Individual", "polea"],
  ]);

  assert.deepEqual(catalog, [
    {
      base: "Press Inclinado",
      variant: "Mancuernas",
      kind: "mancuerna",
      excelName: "press-inclinado",
    },
    {
      base: "Remo",
      variant: "Polea Individual",
      kind: "polea",
      excelName: "remo",
    },
  ]);
});
