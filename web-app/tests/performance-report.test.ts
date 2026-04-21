import test from "node:test";
import assert from "node:assert/strict";

import type { BodyMeasurement, WorkoutSession } from "../src/lib/api.ts";
import { buildPerformanceSnapshot } from "../src/lib/performance-report.ts";

const sessions: WorkoutSession[] = [
  {
    id: "s1",
    title: "Sesion Empuje A",
    training_day: "Dia 1 · Empuje A",
    week_number: 1,
    notes: null,
    created_at: "2026-04-01T10:00:00Z",
    sets: [
      {
        id: "set-1",
        exercise_id: 1,
        position: 1,
        reps: 8,
        rir: 2,
        weight_kg: 80,
        exercise_name: "Press Plano · Barra",
        muscle_group: "Pecho",
        equipment: "disco",
      },
      {
        id: "set-2",
        exercise_id: 1,
        position: 2,
        reps: 8,
        rir: 2,
        weight_kg: 82.5,
        exercise_name: "Press Plano · Barra",
        muscle_group: "Pecho",
        equipment: "disco",
      },
      {
        id: "set-3",
        exercise_id: 2,
        position: 3,
        reps: 12,
        rir: 1,
        weight_kg: 14,
        exercise_name: "Elevaciones Laterales · Mancuerna",
        muscle_group: "Hombros",
        equipment: "mancuerna",
      },
    ],
  },
  {
    id: "s2",
    title: "Sesion Empuje B",
    training_day: "Dia 4 · Empuje B",
    week_number: 2,
    notes: null,
    created_at: "2026-04-08T10:00:00Z",
    sets: [
      {
        id: "set-4",
        exercise_id: 1,
        position: 1,
        reps: 8,
        rir: 1,
        weight_kg: 90,
        exercise_name: "Press Plano · Barra",
        muscle_group: "Pecho",
        equipment: "disco",
      },
      {
        id: "set-5",
        exercise_id: 1,
        position: 2,
        reps: 7,
        rir: 1,
        weight_kg: 92.5,
        exercise_name: "Press Plano · Barra",
        muscle_group: "Pecho",
        equipment: "disco",
      },
      {
        id: "set-6",
        exercise_id: 3,
        position: 3,
        reps: 10,
        rir: 2,
        weight_kg: 25,
        exercise_name: "Extensión Triceps · Polea",
        muscle_group: "Triceps",
        equipment: "polea",
      },
    ],
  },
];

const measurements: BodyMeasurement[] = [
  {
    id: "m2",
    measured_at: "2026-04-09",
    weight_kg: 79,
    body_fat_percent: 15,
    chest_cm: 104,
    waist_cm: 83,
    hip_cm: 98,
    arm_cm: 38,
    thigh_cm: 58,
    notes: null,
  },
  {
    id: "m1",
    measured_at: "2026-04-01",
    weight_kg: 80,
    body_fat_percent: 16,
    chest_cm: 103,
    waist_cm: 85,
    hip_cm: 99,
    arm_cm: 37.5,
    thigh_cm: 57.5,
    notes: null,
  },
];

test("buildPerformanceSnapshot genera progresión semanal, recomendaciones y distribución muscular", () => {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);

  assert.equal(snapshot.totalSessions, 2);
  assert.equal(snapshot.totalWeeksTracked, 2);
  assert.equal(snapshot.dataReadiness, "muy_baja");
  assert.equal(snapshot.bestImprovement?.exerciseName, "Press Plano · Barra");
  assert.equal(snapshot.favoriteExercise?.exerciseName, "Press Plano · Barra");
  assert.equal(snapshot.exerciseWeeklyProgress.length >= 3, true);
  assert.equal(snapshot.exerciseReportRows[0]?.exerciseName, "Press Plano · Barra");
  assert.equal(snapshot.muscleDistribution[0]?.muscleGroup, "Pecho");
  assert.equal(snapshot.recommendations.length > 0, true);
});

test("buildPerformanceSnapshot detecta cambios de peso y registros personales", () => {
  const snapshot = buildPerformanceSnapshot(sessions, measurements);

  assert.equal(snapshot.latestWeightKg, 79);
  assert.equal(snapshot.weightDeltaKg, -1);
  assert.equal(snapshot.personalRecords.heaviestSet?.value, 92.5);
  assert.equal(snapshot.personalRecords.bestEstimatedRm?.exerciseName, "Press Plano · Barra");
});
