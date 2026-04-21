import type { BodyMeasurement, WorkoutSession } from "@/lib/api";

export type TrendPoint = {
  label: string;
  value: number;
};

export type ExerciseBestPoint = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  createdAt: string;
  reps: number;
  rir: number;
  weightKg: number;
  estimatedRm: number;
};

export type ExerciseImprovement = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  startEstimatedRm: number;
  latestEstimatedRm: number;
  deltaKg: number;
  deltaPercent: number;
  history: TrendPoint[];
  lastDate: string;
};

export type PerformanceSnapshot = {
  totalSessions: number;
  totalSets: number;
  totalVolumeKg: number;
  averageSessionVolumeKg: number;
  averageSessionRir: number;
  latestWeightKg: number | null;
  weightDeltaKg: number | null;
  bestImprovement: ExerciseImprovement | null;
  topImprovements: ExerciseImprovement[];
  weightTrend: TrendPoint[];
  sessionVolumeTrend: TrendPoint[];
  sessionRirTrend: TrendPoint[];
  sessionFrequencyTrend: TrendPoint[];
  topExerciseTrend: TrendPoint[];
};

function normalizeDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T12:00:00`
    : trimmed.includes("T")
      ? trimmed
      : `${trimmed.replace(" ", "T")}Z`;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function formatReportDate(value: string | null | undefined) {
  const parsed = normalizeDate(value);
  if (!parsed) {
    return "--";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function getEquivalentReps(reps: number, rir: number) {
  return reps + rir;
}

export function estimateRm(weightKg: number, reps: number, rir: number) {
  return weightKg * (1 + getEquivalentReps(reps, rir) / 30);
}

export function getSessionVolume(session: WorkoutSession) {
  return session.sets.reduce((total, item) => total + item.reps * item.weight_kg, 0);
}

export function getAverageSessionRir(session: WorkoutSession) {
  if (session.sets.length === 0) {
    return 0;
  }

  const totalRir = session.sets.reduce((total, item) => total + item.rir, 0);
  return totalRir / session.sets.length;
}

function getBestSetScore(weightKg: number, reps: number, rir: number) {
  return estimateRm(weightKg, reps, rir) * 1000 + reps * 10 - rir;
}

function buildExerciseHistory(sessions: WorkoutSession[]) {
  const orderedSessions = [...sessions].sort((left, right) => {
    const leftTime = normalizeDate(left.created_at)?.getTime() ?? 0;
    const rightTime = normalizeDate(right.created_at)?.getTime() ?? 0;
    return leftTime - rightTime;
  });

  const history = new Map<number, ExerciseBestPoint[]>();

  orderedSessions.forEach((session) => {
    const bestByExercise = new Map<number, ExerciseBestPoint>();

    session.sets.forEach((setItem) => {
      const candidate: ExerciseBestPoint = {
        exerciseId: setItem.exercise_id,
        exerciseName: setItem.exercise_name,
        muscleGroup: setItem.muscle_group,
        createdAt: session.created_at,
        reps: setItem.reps,
        rir: setItem.rir,
        weightKg: Number(setItem.weight_kg),
        estimatedRm: estimateRm(Number(setItem.weight_kg), setItem.reps, setItem.rir),
      };

      const current = bestByExercise.get(setItem.exercise_id);
      if (
        !current ||
        getBestSetScore(candidate.weightKg, candidate.reps, candidate.rir) >
          getBestSetScore(current.weightKg, current.reps, current.rir)
      ) {
        bestByExercise.set(setItem.exercise_id, candidate);
      }
    });

    bestByExercise.forEach((entry, exerciseId) => {
      const items = history.get(exerciseId) ?? [];
      items.push(entry);
      history.set(exerciseId, items);
    });
  });

  return history;
}

function buildSessionFrequencyTrend(sessions: WorkoutSession[]) {
  const buckets = new Map<string, number>();

  [...sessions]
    .sort((left, right) => {
      const leftTime = normalizeDate(left.created_at)?.getTime() ?? 0;
      const rightTime = normalizeDate(right.created_at)?.getTime() ?? 0;
      return leftTime - rightTime;
    })
    .forEach((session) => {
      const date = normalizeDate(session.created_at);
      if (!date) {
        return;
      }

      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `${date.getFullYear()}-${month}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });

  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

export function buildPerformanceSnapshot(
  sessions: WorkoutSession[],
  measurements: BodyMeasurement[]
): PerformanceSnapshot {
  const totalSets = sessions.reduce((sum, session) => sum + session.sets.length, 0);
  const totalVolumeKg = sessions.reduce((sum, session) => sum + getSessionVolume(session), 0);
  const averageSessionVolumeKg = sessions.length ? totalVolumeKg / sessions.length : 0;
  const averageSessionRir =
    sessions.length > 0
      ? sessions.reduce((sum, session) => sum + getAverageSessionRir(session), 0) / sessions.length
      : 0;

  const orderedMeasurements = [...measurements]
    .filter((item) => item.weight_kg !== null)
    .sort((left, right) => {
      const leftTime = normalizeDate(left.measured_at)?.getTime() ?? 0;
      const rightTime = normalizeDate(right.measured_at)?.getTime() ?? 0;
      return leftTime - rightTime;
    });

  const latestWeightKg =
    orderedMeasurements.length > 0 ? Number(orderedMeasurements[orderedMeasurements.length - 1].weight_kg) : null;
  const weightDeltaKg =
    orderedMeasurements.length > 1
      ? Number(orderedMeasurements[orderedMeasurements.length - 1].weight_kg) -
        Number(orderedMeasurements[0].weight_kg)
      : null;

  const weightTrend = orderedMeasurements.map((item) => ({
    label: formatReportDate(item.measured_at),
    value: Number(item.weight_kg),
  }));

  const orderedSessions = [...sessions].sort((left, right) => {
    const leftTime = normalizeDate(left.created_at)?.getTime() ?? 0;
    const rightTime = normalizeDate(right.created_at)?.getTime() ?? 0;
    return leftTime - rightTime;
  });

  const sessionVolumeTrend = orderedSessions.map((item) => ({
    label: formatReportDate(item.created_at),
    value: Number(getSessionVolume(item).toFixed(1)),
  }));

  const sessionRirTrend = orderedSessions
    .filter((item) => item.sets.length > 0)
    .map((item) => ({
      label: formatReportDate(item.created_at),
      value: Number(getAverageSessionRir(item).toFixed(1)),
    }));

  const exerciseHistory = buildExerciseHistory(sessions);
  const topImprovements = [...exerciseHistory.values()]
    .filter((items) => items.length >= 2)
    .map((items) => {
      const first = items[0];
      const last = items[items.length - 1];
      const deltaKg = last.estimatedRm - first.estimatedRm;
      const deltaPercent = first.estimatedRm > 0 ? (deltaKg / first.estimatedRm) * 100 : 0;

      return {
        exerciseId: last.exerciseId,
        exerciseName: last.exerciseName,
        muscleGroup: last.muscleGroup,
        startEstimatedRm: first.estimatedRm,
        latestEstimatedRm: last.estimatedRm,
        deltaKg,
        deltaPercent,
        history: items.map((entry) => ({
          label: formatReportDate(entry.createdAt),
          value: Number(entry.estimatedRm.toFixed(1)),
        })),
        lastDate: last.createdAt,
      } satisfies ExerciseImprovement;
    })
    .sort((left, right) => right.deltaPercent - left.deltaPercent);

  const bestImprovement = topImprovements[0] ?? null;

  return {
    totalSessions: sessions.length,
    totalSets,
    totalVolumeKg,
    averageSessionVolumeKg,
    averageSessionRir,
    latestWeightKg,
    weightDeltaKg,
    bestImprovement,
    topImprovements: topImprovements.slice(0, 6),
    weightTrend,
    sessionVolumeTrend,
    sessionRirTrend,
    sessionFrequencyTrend: buildSessionFrequencyTrend(sessions),
    topExerciseTrend: bestImprovement?.history ?? [],
  };
}
