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
    waistCm: "84",
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
  assert.equal(Math.round(result.fatGrams), 58);
  assert.equal(Math.round(result.carbGrams), 443);
  assert.equal(Math.round(result.proteinPerKg * 100) / 100, 1.8);
  assert.equal(Math.round(result.bodyFatPercentEstimate * 10) / 10, 21.1);
  assert.equal(Math.round(result.leanMassKg * 10) / 10, 63.1);
  assert.equal(Math.round(result.fatMassKg * 10) / 10, 16.9);
  assert.equal(Math.round(result.waistToHeightRatio * 100) / 100, 0.47);
});

test("getHarrisBenedictResult usa el ultimo peso registrado si el usuario deja el campo vacio", () => {
  const result = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      sex: "female",
      age: "28",
      heightCm: "165",
      weightKg: "",
      waistCm: "",
      activity: "light",
      goal: "cut",
    },
    62,
    74
  );

  assert.ok(result);
  assert.equal(result.weightKg, 62);
  assert.equal(result.waistCm, 74);
  assert.equal(Math.round(result.targetCalories), 1640);
  assert.equal(Math.round(result.proteinGrams), 112);
  assert.equal(Math.round(result.proteinPerKg * 100) / 100, 1.8);
  assert.equal(Math.round(result.bodyFatPercentEstimate * 10) / 10, 31.4);
});

test("getHarrisBenedictResult devuelve null si faltan datos clave", () => {
  const result = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      age: "",
      heightCm: "182",
      weightKg: "",
      waistCm: "",
    },
    null,
    null
  );

  assert.equal(result, null);
});

test("getHarrisBenedictResult eleva la proteina y deja mas carbos disponibles cuando sube la actividad", () => {
  const sedentary = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      sex: "male",
      age: "35",
      heightCm: "178",
      weightKg: "82",
      waistCm: "92",
      activity: "sedentary",
      goal: "cut",
    },
    null,
    null
  );
  const athlete = getHarrisBenedictResult(
    {
      ...initialHarrisDraft,
      sex: "male",
      age: "35",
      heightCm: "178",
      weightKg: "82",
      waistCm: "92",
      activity: "athlete",
      goal: "cut",
    },
    null,
    null
  );

  assert.ok(sedentary);
  assert.ok(athlete);
  assert.equal(sedentary.proteinPerKg >= 1.3, true);
  assert.equal(sedentary.proteinPerKg <= 2, true);
  assert.equal(athlete.proteinPerKg >= 1.3, true);
  assert.equal(athlete.proteinPerKg <= 2, true);
  assert.equal(athlete.carbGrams > sedentary.carbGrams, true);
  assert.equal(athlete.guidance.carbsFocus.includes("rendimiento"), true);
});
