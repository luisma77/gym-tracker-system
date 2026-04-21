import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  getHarrisBenedictResult,
  initialHarrisDraft,
  type HarrisDraft,
} from "../src/lib/harris-benedict.ts";

test("getHarrisBenedictResult calcula mantenimiento y macros con los datos introducidos", () => {
  const draft: HarrisDraft = {
    ...initialHarrisDraft,
    sex: "male",
    age: "30",
    heightCm: "180",
    weightKg: "80",
    activity: "moderate",
    goal: "maintain",
  };

  const result = getHarrisBenedictResult(draft, null);

  assert.ok(result);
  assert.equal(result.age, 30);
  assert.equal(result.heightCm, 180);
  assert.equal(result.weightKg, 80);
  assert.equal(result.activity.factor, ACTIVITY_OPTIONS.find((item) => item.value === "moderate")?.factor);
  assert.equal(result.goal.delta, GOAL_OPTIONS.find((item) => item.value === "maintain")?.delta);
  assert.equal(Math.round(result.bmr), 1854);
  assert.equal(Math.round(result.tdee), 2873);
  assert.equal(Math.round(result.targetCalories), 2873);
  assert.equal(Math.round(result.bmi * 10) / 10, 24.7);
  assert.equal(Math.round(result.proteinGrams), 144);
  assert.equal(Math.round(result.fatGrams), 64);
  assert.equal(Math.round(result.carbGrams), 430);
});

test("getHarrisBenedictResult usa el ultimo peso registrado si el usuario deja el campo vacio", () => {
  const result = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      sex: "female",
      age: "28",
      heightCm: "165",
      weightKg: "",
      activity: "light",
      goal: "cut",
    },
    62
  );

  assert.ok(result);
  assert.equal(result.weightKg, 62);
  assert.equal(Math.round(result.targetCalories), 1640);
  assert.equal(Math.round(result.proteinGrams), 136);
});

test("getHarrisBenedictResult devuelve null si faltan datos clave", () => {
  const result = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      age: "",
      heightCm: "182",
      weightKg: "",
    },
    null
  );

  assert.equal(result, null);
});
