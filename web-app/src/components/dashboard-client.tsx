"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createMeasurement,
  createSession,
  fetchDashboard,
  fetchExercises,
  fetchMeasurements,
  fetchSessions,
  signOutUser,
  type BodyMeasurement,
  type DashboardSummary,
  type Exercise,
  type WorkoutSession,
} from "@/lib/api";
import { clearAuthSession, getAuthToken, getStoredUser } from "@/lib/auth-storage";
import { dayTemplates } from "@/lib/day-templates";
import { seedExercises, type SeedExercise } from "@/lib/exercise-seed";
import { getSetGridTemplate } from "@/lib/session-layout";

type StoredUser = {
  email: string;
  full_name: string;
};

type DashboardTab = "overview" | "workout" | "measurements" | "charts";
type BlockType = "HIP" | "FUE";
type DayKind = "push" | "pull" | "legs";
type ProgressAction = "SIN_DATOS" | "SUBE" | "MANTEN" | "BAJA";
type ExtraRating = "++" | "+" | "-" | "--";

type EnrichedExercise = Exercise & {
  base: string;
  variant: string;
  kind: string;
  excel_name: string;
};

type SetDraft = {
  reps: string;
  rir: string;
  weightKg: string;
};

type ExerciseRowDraft = {
  key: string;
  section: string;
  subfamily: string | null;
  family: string;
  exerciseId: string;
  isExtra: boolean;
  sets: SetDraft[];
};

type SessionDraft = {
  title: string;
  trainingDay: string;
  weekNumber: number;
  notes: string;
  rows: ExerciseRowDraft[];
};

type MeasurementDraft = {
  measuredAt: string;
  weightKg: string;
  bodyFatPercent: string;
  chestCm: string;
  waistCm: string;
  hipCm: string;
  armCm: string;
  thighCm: string;
  notes: string;
};

type BestSetRecord = {
  exerciseId: number;
  reps: number;
  rir: number;
  weightKg: number;
  sessionId: string;
  createdAt: string;
};

type ExerciseProgress = {
  action: ProgressAction;
  suggestedWeight: number | null;
  targetReps: number | null;
  label: string;
  lastWeight: number | null;
  lastReps: number | null;
  lastRir: number | null;
};

type MuscleSummary = {
  group: string;
  phase: string;
  stale: boolean;
};

const PPL_CYCLE: Array<{ label: string; shortLabel: string; kind: DayKind }> = [
  { label: "Dia 1 · Empuje A", shortLabel: "Empuje A", kind: "push" },
  { label: "Dia 2 · Tiron A", shortLabel: "Tiron A", kind: "pull" },
  { label: "Dia 3 · Pierna A", shortLabel: "Pierna A", kind: "legs" },
  { label: "Dia 4 · Empuje B", shortLabel: "Empuje B", kind: "push" },
  { label: "Dia 5 · Tiron B", shortLabel: "Tiron B", kind: "pull" },
  { label: "Dia 6 · Pierna B", shortLabel: "Pierna B", kind: "legs" },
];

const BLOCK_RULES: Record<BlockType, { repsMin: number; repsMax: number }> = {
  HIP: { repsMin: 6, repsMax: 12 },
  FUE: { repsMin: 3, repsMax: 6 },
};

const WEEKLY_SET_TARGETS: Record<string, { min: number; max: number }> = {
  Antebrazo: { min: 4, max: 10 },
  Biceps: { min: 6, max: 14 },
  Core: { min: 4, max: 12 },
  Cuadriceps: { min: 8, max: 18 },
  Espalda: { min: 10, max: 20 },
  Femoral: { min: 6, max: 16 },
  Gluteos: { min: 6, max: 16 },
  Hombros: { min: 8, max: 18 },
  Pantorrillas: { min: 6, max: 16 },
  Pecho: { min: 8, max: 18 },
  Trapecios: { min: 4, max: 12 },
  Triceps: { min: 6, max: 14 },
};

const POLEA_LEVELS = [5, 10, 17.5, 25, 32.5, 40, 45, 52.5, 60, 67.5, 75, 80, 87.5, 95, 102.5, 110];
const WEEK_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const SERIES_PER_ROW = 5;

const initialMeasurementDraft: MeasurementDraft = {
  measuredAt: "",
  weightKg: "",
  bodyFatPercent: "",
  chestCm: "",
  waistCm: "",
  hipCm: "",
  armCm: "",
  thighCm: "",
  notes: "",
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

function formatDate(value: string | null | undefined) {
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

function buildLinePath(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const height = 180;
  const width = 360;
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatDecimal(value: number) {
  return value.toFixed(1).replace(".", ",");
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getCycleIndex(trainingDay: string) {
  const index = PPL_CYCLE.findIndex((item) => item.label === trainingDay);
  return index >= 0 ? index : 0;
}

function getDayKind(trainingDay: string): DayKind {
  return PPL_CYCLE[getCycleIndex(trainingDay)]?.kind ?? "push";
}

function getSectionColor(section: string) {
  if (section.includes("PECHO") || section.includes("HOMBRO") || section.includes("BICEPS") || section.includes("TRICEPS")) {
    return "blue";
  }
  if (section.includes("CUADRICEPS") || section.includes("FEMORAL") || section.includes("GEMELO") || section.includes("PIERNA")) {
    return "green";
  }
  if (section.includes("LUMBAR") || section.includes("CORE") || section.includes("CIERRE")) {
    return "dark";
  }
  return "blue";
}

function getMainGroups(dayKind: DayKind) {
  if (dayKind === "push") {
    return new Set(["Pecho", "Hombros"]);
  }
  if (dayKind === "pull") {
    return new Set(["Espalda", "Trapecios"]);
  }
  return new Set(["Cuadriceps", "Femoral", "Gluteos", "Pantorrillas"]);
}

function getOppositeGroups(dayKind: DayKind) {
  if (dayKind === "push") {
    return new Set(["Espalda", "Trapecios"]);
  }
  if (dayKind === "pull") {
    return new Set(["Pecho", "Hombros"]);
  }
  return new Set(["Pecho", "Espalda", "Hombros", "Trapecios"]);
}

function getEquivalentReps(record: Pick<BestSetRecord, "reps" | "rir">) {
  return record.reps + record.rir;
}

function estimateRm(record: Pick<BestSetRecord, "weightKg" | "reps" | "rir">) {
  return record.weightKg * (1 + getEquivalentReps(record) / 30);
}

function getBestSetScore(record: Pick<BestSetRecord, "weightKg" | "reps" | "rir">) {
  return estimateRm(record) * 1000 + record.reps * 10 - record.rir;
}

function getNextPoleaLevel(weight: number) {
  const index = POLEA_LEVELS.findIndex((level) => level === weight);
  if (index === -1) {
    return weight;
  }

  return POLEA_LEVELS[Math.min(POLEA_LEVELS.length - 1, index + 1)];
}

function getPreviousPoleaLevel(weight: number) {
  const index = POLEA_LEVELS.findIndex((level) => level === weight);
  if (index === -1) {
    return Math.max(0, weight - 5);
  }

  return POLEA_LEVELS[Math.max(0, index - 1)];
}

function formatWeight(value: number | null) {
  if (value === null) {
    return "--";
  }
  return value % 1 === 0 ? String(value) : value.toFixed(1).replace(".", ",");
}

function getWeightLabel(exercise: EnrichedExercise | null) {
  if (!exercise) {
    return "Peso kg";
  }

  const lowerName = exercise.name.toLowerCase();
  if (exercise.kind === "mancuerna" || lowerName.includes("unilateral") || lowerName.includes("individual")) {
    return "kg (unilateral)";
  }

  if (exercise.kind === "peso_corporal" && /(fondos|dominadas)/i.test(exercise.name)) {
    return "Lastre kg";
  }

  return "Peso kg";
}

function getJumpWeight(exercise: EnrichedExercise, currentWeight: number, direction: "up" | "down") {
  if (exercise.kind === "polea") {
    return direction === "up" ? getNextPoleaLevel(currentWeight) : getPreviousPoleaLevel(currentWeight);
  }

  if (exercise.kind === "peso_corporal" && /(fondos|dominadas)/i.test(exercise.name)) {
    return Math.max(0, currentWeight + (direction === "up" ? 2.5 : -2.5));
  }

  return Math.max(0, currentWeight + (direction === "up" ? 2.5 : -2.5));
}

function isImprovement(current: BestSetRecord, previous: BestSetRecord) {
  if (current.weightKg > previous.weightKg) {
    return true;
  }

  if (current.weightKg < previous.weightKg) {
    return false;
  }

  return getEquivalentReps(current) > getEquivalentReps(previous);
}

function defaultSetDraft(): SetDraft {
  return {
    reps: "",
    rir: "",
    weightKg: "",
  };
}

function createSetDrafts(count: number) {
  return Array.from({ length: count }, () => defaultSetDraft());
}

function buildInitialRows(
  trainingDay: string,
  blockType: BlockType,
  exercises: EnrichedExercise[]
): ExerciseRowDraft[] {
  const template = dayTemplates.find((item) => item.label === trainingDay) ?? dayTemplates[0];

  return template.sections.flatMap((section) =>
    section.entries.map((entry, index) => {
      const matchingExercise = exercises.find(
        (exercise) => exercise.base === entry.family && exercise.variant === entry.variant
      );

      return {
        key: `${template.label}-${section.section}-${entry.family}-${index}`,
        section: section.section,
        subfamily: entry.subfamily,
        family: entry.family,
        exerciseId: matchingExercise ? String(matchingExercise.id) : "",
        isExtra: false,
        sets: createSetDrafts(Math.min(SERIES_PER_ROW, entry.defaultSets)),
      };
    })
  );
}

function buildInitialDraft(
  trainingDay: string,
  weekNumber: number,
  blockType: BlockType,
  exercises: EnrichedExercise[]
): SessionDraft {
  const cycle = PPL_CYCLE[getCycleIndex(trainingDay)];
  return {
    title: `Sesion ${cycle.shortLabel}`,
    trainingDay,
    weekNumber,
    notes: "",
    rows: buildInitialRows(trainingDay, blockType, exercises),
  };
}

function getSessionTitle(trainingDay: string) {
  const cycle = PPL_CYCLE[getCycleIndex(trainingDay)];
  return `Sesion ${cycle.shortLabel}`;
}

function getProgressLabel(action: ProgressAction, suggestedWeight: number | null, targetReps: number | null) {
  if (action === "SIN_DATOS") {
    return "Sin datos anteriores";
  }

  if (suggestedWeight === null || targetReps === null) {
    return `[${action}]`;
  }

  return `[${action}] a ${formatWeight(suggestedWeight)} kg a ${targetReps} repes`;
}

function getProgressionForExercise(
  exercise: EnrichedExercise | null,
  history: BestSetRecord[],
  blockType: BlockType
): ExerciseProgress {
  if (!exercise || history.length === 0) {
    return {
      action: "SIN_DATOS",
      suggestedWeight: null,
      targetReps: null,
      label: "Sin datos anteriores",
      lastWeight: null,
      lastReps: null,
      lastRir: null,
    };
  }

  const rules = BLOCK_RULES[blockType];
  const latest = history[0];
  const previous = history[1] ?? null;
  const beforePrevious = history[2] ?? null;
  const reachedTop = latest.reps >= rules.repsMax || getEquivalentReps(latest) >= rules.repsMax;
  const stalledTwice =
    !!previous &&
    !!beforePrevious &&
    !isImprovement(latest, previous) &&
    !isImprovement(previous, beforePrevious);

  let action: ProgressAction = "MANTEN";
  let suggestedWeight = latest.weightKg;
  let targetReps = Math.min(rules.repsMax, latest.reps + 1);

  if (stalledTwice) {
    action = "BAJA";
    suggestedWeight = getJumpWeight(exercise, latest.weightKg, "down");
    targetReps = rules.repsMin;
  } else if (reachedTop) {
    action = "SUBE";
    suggestedWeight = getJumpWeight(exercise, latest.weightKg, "up");
    targetReps = rules.repsMin;
  }

  return {
    action,
    suggestedWeight,
    targetReps,
    label: getProgressLabel(action, suggestedWeight, targetReps),
    lastWeight: latest.weightKg,
    lastReps: latest.reps,
    lastRir: latest.rir,
  };
}

function getSessionVolume(session: WorkoutSession) {
  return session.sets.reduce((total, item) => total + item.reps * item.weight_kg, 0);
}

function getAverageSessionRir(session: WorkoutSession) {
  if (session.sets.length === 0) {
    return 0;
  }

  const totalRir = session.sets.reduce((total, item) => total + item.rir, 0);
  return totalRir / session.sets.length;
}

function getWeeklyStatus(group: string, weeklySets: number) {
  const target = WEEKLY_SET_TARGETS[group] ?? { min: 6, max: 14 };
  if (weeklySets < target.min) {
    return "Bajo";
  }
  if (weeklySets > target.max) {
    return "Alto";
  }
  return "Optimo";
}

function getExtraRatingLabel(rating: ExtraRating) {
  if (rating === "++") {
    return "Muy recomendable";
  }
  if (rating === "+") {
    return "Buena opcion";
  }
  if (rating === "-") {
    return "Lo pisaria con cuidado";
  }
  return "No lo valoro bien";
}

function isCoreOrLumbarExercise(exercise: EnrichedExercise | null) {
  if (!exercise) {
    return false;
  }

  return /(hiperextension|crunch|elevacion piernas|plancha|rueda abdominal)/i.test(exercise.name);
}

function getExtraExerciseRating(
  exercise: EnrichedExercise | null,
  dayKind: DayKind,
  activeRows: ExerciseRowDraft[],
  exercisesById: Map<number, EnrichedExercise>
): ExtraRating | null {
  if (!exercise) {
    return null;
  }

  const selectedExercises = activeRows
    .map((row) => exercisesById.get(Number(row.exerciseId)))
    .filter((item): item is EnrichedExercise => Boolean(item));

  const hasBiceps = selectedExercises.some((item) => item.muscle_group === "Biceps");
  const hasTriceps = selectedExercises.some((item) => item.muscle_group === "Triceps");
  const mainGroups = getMainGroups(dayKind);
  const oppositeGroups = getOppositeGroups(dayKind);

  if (isCoreOrLumbarExercise(exercise)) {
    return "++";
  }

  if ((dayKind === "push" || dayKind === "pull") && !hasBiceps && !hasTriceps) {
    if (exercise.muscle_group === "Biceps" || exercise.muscle_group === "Triceps") {
      return "++";
    }
  }

  if (dayKind === "push") {
    if (exercise.muscle_group === "Biceps") {
      return hasBiceps ? "+" : "++";
    }
    if (exercise.muscle_group === "Triceps") {
      return hasTriceps ? "-" : "+";
    }
  }

  if (dayKind === "pull") {
    if (exercise.muscle_group === "Triceps") {
      return hasTriceps ? "+" : "++";
    }
    if (exercise.muscle_group === "Biceps") {
      return hasBiceps ? "-" : "+";
    }
  }

  if (mainGroups.has(exercise.muscle_group)) {
    return "--";
  }

  if (oppositeGroups.has(exercise.muscle_group)) {
    return "-";
  }

  if (dayKind === "legs" && (exercise.muscle_group === "Core" || exercise.muscle_group === "Femoral")) {
    return "+";
  }

  return "-";
}

function getDayAddHints(dayKind: DayKind, rows: ExerciseRowDraft[], exercisesById: Map<number, EnrichedExercise>) {
  const selectedExercises = rows
    .map((row) => exercisesById.get(Number(row.exerciseId)))
    .filter((item): item is EnrichedExercise => Boolean(item));

  const hints: Array<{ text: string; rating: ExtraRating }> = [];
  const hasBiceps = selectedExercises.some((item) => item.muscle_group === "Biceps");
  const hasTriceps = selectedExercises.some((item) => item.muscle_group === "Triceps");
  const hasCore = selectedExercises.some((item) => /(crunch|elevacion piernas|plancha|rueda abdominal)/i.test(item.name));
  const hasLumbar = selectedExercises.some((item) => /hiperextension/i.test(item.name));

  if (dayKind === "push") {
    if (!hasBiceps && hasTriceps) {
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de BICEPS", rating: "++" });
    } else if (!hasBiceps && !hasTriceps) {
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de BICEPS", rating: "++" });
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de TRICEPS", rating: "++" });
    }
  }

  if (dayKind === "pull") {
    if (!hasTriceps && hasBiceps) {
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de TRICEPS", rating: "++" });
    } else if (!hasBiceps && !hasTriceps) {
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de BICEPS", rating: "++" });
      hints.push({ text: "SUGIERO QUE AÑADAS 1 ejercicio de TRICEPS", rating: "++" });
    }
  }

  if (!hasLumbar) {
    hints.push({ text: "Hiperextension lumbar suma mucho aqui", rating: "++" });
  }

  if (!hasCore) {
    hints.push({ text: "Core extra tipo Crunch o Elevacion de Piernas", rating: "++" });
  }

  return hints;
}

export function DashboardClient() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<EnrichedExercise[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [draft, setDraft] = useState<SessionDraft>({
    title: "Sesion PPL",
    trainingDay: PPL_CYCLE[0].label,
    weekNumber: 1,
    notes: "",
    rows: [],
  });
  const [measurementDraft, setMeasurementDraft] = useState<MeasurementDraft>(initialMeasurementDraft);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [error, setError] = useState("");

  const blockType: BlockType = summary?.block_type === "FUE" ? "FUE" : "HIP";
  const currentWeek = summary?.current_week ?? 1;
  const dayKind = getDayKind(draft.trainingDay);

  const exerciseSeedMap = useMemo(() => {
    return new Map<string, SeedExercise>(seedExercises.map((item) => [item.name, item]));
  }, []);

  const exercisesById = useMemo(() => {
    return new Map<number, EnrichedExercise>(exercises.map((exercise) => [exercise.id, exercise]));
  }, [exercises]);

  const familyOptions = useMemo(() => {
    const grouped = new Map<string, EnrichedExercise[]>();
    exercises.forEach((exercise) => {
      const items = grouped.get(exercise.base) ?? [];
      items.push(exercise);
      grouped.set(exercise.base, items);
    });

    grouped.forEach((items, key) => {
      grouped.set(
        key,
        [...items].sort((left, right) => left.variant.localeCompare(right.variant, "es"))
      );
    });

    return grouped;
  }, [exercises]);

  const extraExerciseOptions = useMemo(() => {
    return [...exercises].sort((left, right) => left.name.localeCompare(right.name, "es"));
  }, [exercises]);

  const exerciseHistory = useMemo(() => {
    const history = new Map<number, BestSetRecord[]>();
    const orderedSessions = [...sessions].sort((left, right) => {
      const leftTime = normalizeDate(left.created_at)?.getTime() ?? 0;
      const rightTime = normalizeDate(right.created_at)?.getTime() ?? 0;
      return rightTime - leftTime;
    });

    orderedSessions.forEach((session) => {
      const bestByExercise = new Map<number, BestSetRecord>();

      session.sets.forEach((setItem) => {
        const candidate: BestSetRecord = {
          exerciseId: setItem.exercise_id,
          reps: setItem.reps,
          rir: setItem.rir,
          weightKg: setItem.weight_kg,
          sessionId: session.id,
          createdAt: session.created_at,
        };

        const previous = bestByExercise.get(setItem.exercise_id);
        if (!previous || getBestSetScore(candidate) > getBestSetScore(previous)) {
          bestByExercise.set(setItem.exercise_id, candidate);
        }
      });

      bestByExercise.forEach((record, exerciseId) => {
        history.set(exerciseId, [...(history.get(exerciseId) ?? []), record]);
      });
    });

    return history;
  }, [sessions]);

  const progressByExercise = useMemo(() => {
    const map = new Map<number, ExerciseProgress>();
    exercises.forEach((exercise) => {
      map.set(exercise.id, getProgressionForExercise(exercise, exerciseHistory.get(exercise.id) ?? [], blockType));
    });
    return map;
  }, [blockType, exerciseHistory, exercises]);

  const measurementTrend = [...measurements]
    .reverse()
    .filter((item) => item.weight_kg !== null)
    .map((item) => ({ label: formatDate(item.measured_at), value: Number(item.weight_kg) }));

  const volumeTrend = [...sessions]
    .reverse()
    .map((item) => ({ label: formatDate(item.created_at), value: getSessionVolume(item) }));

  const rirTrend = [...sessions]
    .reverse()
    .filter((item) => item.sets.length > 0)
    .map((item) => ({
      label: formatDate(item.created_at),
      value: Number(getAverageSessionRir(item).toFixed(1)),
    }));

  const currentWeekSessions = sessions.filter((session) => session.week_number === currentWeek);

  const weeklyVolumeByGroup = useMemo(() => {
    const groups = Array.from(new Set(exercises.map((item) => item.muscle_group))).sort((left, right) =>
      left.localeCompare(right, "es")
    );

    const aggregate = currentWeekSessions.reduce<Record<string, { sets: number; load: number }>>((acc, session) => {
      session.sets.forEach((setItem) => {
        acc[setItem.muscle_group] ??= { sets: 0, load: 0 };
        acc[setItem.muscle_group].sets += 1;
        acc[setItem.muscle_group].load += setItem.reps * setItem.weight_kg;
      });
      return acc;
    }, {});

    return groups.map((group) => ({
      group,
      weeklySets: aggregate[group]?.sets ?? 0,
      weeklyLoad: aggregate[group]?.load ?? 0,
      status: getWeeklyStatus(group, aggregate[group]?.sets ?? 0),
      target: WEEKLY_SET_TARGETS[group] ?? { min: 6, max: 14 },
    }));
  }, [currentWeekSessions, exercises]);

  const muscleSummary = useMemo<MuscleSummary[]>(() => {
    const groups = Array.from(new Set(exercises.map((item) => item.muscle_group))).sort((left, right) =>
      left.localeCompare(right, "es")
    );
    const lastTwoSessions = sessions.slice(0, 2);

    return groups.map((group) => {
      const groupExercises = exercises.filter((item) => item.muscle_group === group);
      const stale = !lastTwoSessions.some((session) => session.sets.some((setItem) => setItem.muscle_group === group));

      let phase = "Sin datos";
      if (stale) {
        phase = "Muy poco volumen 😞";
      } else {
        const actions = groupExercises
          .map((exercise) => progressByExercise.get(exercise.id)?.action ?? "SIN_DATOS")
          .filter((action) => action !== "SIN_DATOS");

        if (actions.includes("BAJA")) {
          phase = "Ajuste a la baja";
        } else if (actions.includes("SUBE")) {
          phase = "Subiendo";
        } else if (actions.includes("MANTEN")) {
          phase = "Manteniendo";
        }
      }

      return { group, phase, stale };
    });
  }, [exercises, progressByExercise, sessions]);

  const addHints = useMemo(() => getDayAddHints(dayKind, draft.rows, exercisesById), [dayKind, draft.rows, exercisesById]);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getStoredUser<StoredUser>();

    if (!storedToken || !storedUser) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    Promise.all([
      fetchDashboard(storedToken),
      fetchSessions(storedToken),
      fetchExercises(),
      fetchMeasurements(storedToken),
    ])
      .then(([dashboard, sessionItems, exerciseItems, measurementItems]) => {
        const enrichedExercises: EnrichedExercise[] = exerciseItems.map((exercise: Exercise) => {
          const seed = exerciseSeedMap.get(exercise.name);
          return {
            ...exercise,
            base: seed?.base ?? exercise.name,
            variant: seed?.variant ?? exercise.equipment,
            kind: seed?.kind ?? "disco",
            excel_name: seed?.excel_name ?? exercise.name,
          };
        });

        const nextDay = PPL_CYCLE[sessionItems.length % PPL_CYCLE.length];

        setSummary(dashboard);
        setSessions(sessionItems);
        setExercises(enrichedExercises);
        setMeasurements(measurementItems);
        setDraft(buildInitialDraft(nextDay.label, dashboard.current_week ?? 1, dashboard.block_type === "FUE" ? "FUE" : "HIP", enrichedExercises));
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "No se han podido cargar los datos.");
      })
      .finally(() => setLoading(false));
  }, [exerciseSeedMap, router]);

  function rebuildDraftForDay(trainingDay: string) {
    setDraft((current) => ({
      ...buildInitialDraft(trainingDay, current.weekNumber, blockType, exercises),
      notes: current.notes,
    }));
  }

  function updateRow(rowKey: string, updater: (row: ExerciseRowDraft) => ExerciseRowDraft) {
    setDraft((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.key === rowKey ? updater(row) : row)),
    }));
  }

  function updateSetValue(rowKey: string, setIndex: number, field: keyof SetDraft, value: string) {
    updateRow(rowKey, (row) => ({
      ...row,
      sets: row.sets.map((setItem, index) => (index === setIndex ? { ...setItem, [field]: value } : setItem)),
    }));
  }

  function addSetToRow(rowKey: string) {
    updateRow(rowKey, (row) => {
      if (row.sets.length >= SERIES_PER_ROW) {
        return row;
      }
      return {
        ...row,
        sets: [...row.sets, defaultSetDraft()],
      };
    });
  }

  function removeSetFromRow(rowKey: string, setIndex: number) {
    updateRow(rowKey, (row) => ({
      ...row,
      sets: row.sets.length === 1 ? row.sets : row.sets.filter((_, index) => index !== setIndex),
    }));
  }

  function changeRowExercise(rowKey: string, exerciseId: string) {
    updateRow(rowKey, (row) => {
      const nextExercise = exercisesById.get(Number(exerciseId));
      return {
        ...row,
        exerciseId,
        family: nextExercise?.base ?? row.family,
      };
    });
  }

  function addExtraRow() {
    setDraft((current) => ({
      ...current,
      rows: [
        ...current.rows,
        {
          key: `extra-${Date.now()}-${current.rows.length}`,
          section: "EXTRA",
          subfamily: null,
          family: "Extra",
          exerciseId: "",
          isExtra: true,
          sets: createSetDrafts(3),
        },
      ],
    }));
  }

  function removeExtraRow(rowKey: string) {
    setDraft((current) => ({
      ...current,
      rows: current.rows.filter((row) => row.key !== rowKey),
    }));
  }

  function applyProgression(rowKey: string) {
    const row = draft.rows.find((item) => item.key === rowKey);
    if (!row) {
      return;
    }

    const exercise = exercisesById.get(Number(row.exerciseId)) ?? null;
    const progression = exercise ? progressByExercise.get(exercise.id) : null;
    if (!progression || progression.action === "SIN_DATOS" || progression.suggestedWeight === null || progression.targetReps === null) {
      return;
    }

    updateRow(rowKey, (current) => ({
      ...current,
      sets: current.sets.map((setItem, index) =>
        index === 0
          ? {
              ...setItem,
              reps: String(progression.targetReps),
              rir: blockType === "FUE" ? "1" : "2",
              weightKg: String(progression.suggestedWeight),
            }
          : setItem
      ),
    }));
  }

  async function handleCreateSession() {
    if (!token) {
      return;
    }

    const sets = draft.rows.flatMap((row) => {
      const exerciseId = Number(row.exerciseId);
      if (!exerciseId) {
        return [];
      }

      return row.sets
        .map((setItem) => {
          const reps = parseOptionalNumber(setItem.reps);
          const rir = parseOptionalNumber(setItem.rir);
          const weight = parseOptionalNumber(setItem.weightKg);
          if (reps === null || rir === null || weight === null) {
            return null;
          }

          return {
            exercise_id: exerciseId,
            reps,
            rir,
            weight_kg: weight,
          };
        })
        .filter((item): item is { exercise_id: number; reps: number; rir: number; weight_kg: number } => Boolean(item));
    });

    if (sets.length === 0) {
      setError("Introduce al menos una serie completa con ejercicio, reps, RIR y peso.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const createdSession = await createSession(token, {
        title: draft.title,
        training_day: draft.trainingDay,
        week_number: draft.weekNumber,
        notes: draft.notes,
        sets,
      });

      const [dashboard, sessionItems] = await Promise.all([fetchDashboard(token), fetchSessions(token)]);
      setSummary(dashboard);
      setSessions(sessionItems);
      setDraft(buildInitialDraft(draft.trainingDay, dashboard.current_week ?? draft.weekNumber, dashboard.block_type === "FUE" ? "FUE" : "HIP", exercises));
      setActiveTab("overview");
      setSessions((current) => [createdSession, ...current.filter((item) => item.id !== createdSession.id)]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se ha podido guardar la sesion.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateMeasurement() {
    if (!token) {
      return;
    }

    setSavingMeasurement(true);
    setError("");

    try {
      const payload: Parameters<typeof createMeasurement>[1] = {
        notes: measurementDraft.notes || undefined,
      };

      if (measurementDraft.measuredAt) payload.measured_at = measurementDraft.measuredAt;
      if (measurementDraft.weightKg) payload.weight_kg = Number(measurementDraft.weightKg);
      if (measurementDraft.bodyFatPercent) payload.body_fat_percent = Number(measurementDraft.bodyFatPercent);
      if (measurementDraft.chestCm) payload.chest_cm = Number(measurementDraft.chestCm);
      if (measurementDraft.waistCm) payload.waist_cm = Number(measurementDraft.waistCm);
      if (measurementDraft.hipCm) payload.hip_cm = Number(measurementDraft.hipCm);
      if (measurementDraft.armCm) payload.arm_cm = Number(measurementDraft.armCm);
      if (measurementDraft.thighCm) payload.thigh_cm = Number(measurementDraft.thighCm);

      await createMeasurement(token, payload);
      const measurementItems = await fetchMeasurements(token);
      setMeasurements(measurementItems);
      setMeasurementDraft(initialMeasurementDraft);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se han podido guardar las medidas.");
    } finally {
      setSavingMeasurement(false);
    }
  }

  async function handleLogout() {
    try {
      await signOutUser();
    } finally {
      clearAuthSession();
      router.replace("/login");
    }
  }

  if (loading) {
    return (
      <main>
        <section className="hero">
          <span className="eyebrow">Gym Tracker</span>
          <h1>Cargando tu sistema PPL de 12 semanas...</h1>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Sistema de 12 semanas orientado al PPL</span>
        <h1>Tu Excel, llevado a una web mucho mas clara para registrar el dia completo.</h1>
        <p>
          La app sigue la estructura del Excel: empuje, tiron, pierna, empuje, tiron, pierna;
          muestra la progresion del mismo ejercicio, avisa si te falta volumen y deja cambiar
          solo por variantes validas de la misma familia.
        </p>
        <div className="hero-actions">
          <button className="button primary" onClick={() => setActiveTab("workout")} type="button">
            Registrar sesion
          </button>
          <a
            className="button secondary"
            href="https://github.com/luisma77/gym-tracker-system/raw/main/excel/Gym_Tracker.xlsx"
            target="_blank"
          >
            Descargar Excel
          </a>
          <a className="button secondary" href="/settings">
            Perfil y ajustes
          </a>
          <button className="button secondary" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}

      <section className="card stack">
        <span className="pill">Preview del sistema</span>
        <div className="preview-carousel">
          <article className="preview-slide">
            <strong>1. Plantilla exacta del Excel</strong>
            <p>Cada dia carga la misma estructura base y el mismo orden de ejercicios.</p>
          </article>
          <article className="preview-slide">
            <strong>2. Progresion por ejercicio</strong>
            <p>La sugerencia sale de la mejor serie de la ultima sesion de ese ejercicio exacto.</p>
          </article>
          <article className="preview-slide">
            <strong>3. Resumen rapido</strong>
            <p>Ves fase de progresion por musculo y si alguno lleva 2 sesiones sin tocarse.</p>
          </article>
          <article className="preview-slide">
            <strong>4. Extras valorados</strong>
            <p>Los extras se marcan con ++, +, - o -- para no pasarte de volumen.</p>
          </article>
        </div>
      </section>

      <div className="dashboard-tabs">
        {[
          { id: "overview", label: "Resumen" },
          { id: "workout", label: "Sesion" },
          { id: "measurements", label: "Medidas" },
          { id: "charts", label: "Graficas" },
        ].map((tab) => (
          <button
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Resumen rapido</span>
            <h2>Hola, {user?.full_name ?? "atleta"}</h2>
            <div className="summary-list">
              <div>
                <strong>Bloque actual</strong>
                <span>{blockType === "FUE" ? "Fuerza" : "Hipertrofia"}</span>
              </div>
              <div>
                <strong>Semana</strong>
                <span>{currentWeek} / 12</span>
              </div>
              <div>
                <strong>Siguiente dia</strong>
                <span>{draft.trainingDay}</span>
              </div>
              <div>
                <strong>Total sesiones</strong>
                <span>{summary?.total_sessions ?? sessions.length}</span>
              </div>
            </div>
          </article>

          <article className="card stack">
            <span className="pill">Fase por musculo</span>
            <h2>En que fase vas ahora</h2>
            <div className="muscle-phase-grid">
              {muscleSummary.map((item) => (
                <div className="muscle-phase-card" key={item.group}>
                  <div className="muscle-phase-header">
                    <strong>{item.group}</strong>
                    <span className={`status-badge ${item.stale ? "bajo" : "optimo"}`}>
                      {item.stale ? "2 sesiones sin tocar" : "Activo"}
                    </span>
                  </div>
                  <p>{item.phase}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card stack">
            <span className="pill">Volumen semanal</span>
            <h2>Bajo, optimo o alto por grupo</h2>
            <div className="volume-status-grid">
              {weeklyVolumeByGroup.map((item) => (
                <div className="volume-status-card" key={item.group}>
                  <div className="volume-status-header">
                    <strong>{item.group}</strong>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                  <p>{item.weeklySets} series esta semana</p>
                  <small>
                    Objetivo: {item.target.min}-{item.target.max} series
                  </small>
                </div>
              ))}
            </div>
          </article>

          <article className="card stack">
            <span className="pill">Ultimas sesiones</span>
            <h2>Historial corto</h2>
            {sessions.length === 0 ? (
              <p>Aun no hay sesiones guardadas.</p>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div className="session-item" key={session.id}>
                  <strong>{session.title}</strong>
                  <p>
                    {session.training_day} · Semana {session.week_number} · {formatDate(session.created_at)}
                  </p>
                  <p>RIR medio: {formatDecimal(getAverageSessionRir(session))}</p>
                </div>
              ))
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "workout" ? (
        <section className="stack dashboard-panels">
          <article className="card stack workout-builder">
            <span className="pill">Sesion guiada</span>
            <h2>Registrar el dia entero como en el Excel</h2>
            <p>
              Usa un peso con el que puedas moverte normalmente entre 6 y 15 repes. Aunque con 12 o mas ya puedo sugerir subir sin problema.
            </p>

            <div className="grid split compact-split">
              <label className="field">
                <span>Sesion</span>
                <select
                  onChange={(event) => rebuildDraftForDay(event.target.value)}
                  value={draft.trainingDay}
                >
                  {PPL_CYCLE.map((day) => (
                    <option key={day.label} value={day.label}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Titulo</span>
                <input disabled value={draft.title} />
              </label>
            </div>

            <div className="grid split compact-split">
              <label className="field">
                <span>Semana</span>
                <select
                  onChange={(event) => setDraft((current) => ({ ...current, weekNumber: Number(event.target.value) || 1 }))}
                  value={draft.weekNumber}
                >
                  {WEEK_OPTIONS.map((week) => (
                    <option key={week} value={week}>
                      Semana {week}
                    </option>
                  ))}
                </select>
              </label>
              <div className="session-day-chip">
                <strong>{draft.trainingDay}</strong>
                <span>Bloque {blockType === "FUE" ? "Fuerza" : "Hipertrofia"} · max 5 series por ejercicio</span>
              </div>
            </div>

            <div className="template-sheet-shell">
            <div className="template-sheet">
              {dayTemplates
                .find((template) => template.label === draft.trainingDay)
                ?.sections.map((section) => (
                  <div className="template-section" key={section.section}>
                    <div className={`template-section-title ${getSectionColor(section.section)}`}>
                      {section.section}
                    </div>
                    {draft.rows
                      .filter((row) => !row.isExtra && row.section === section.section)
                      .map((row) => {
                        const exercise = exercisesById.get(Number(row.exerciseId)) ?? null;
                        const progression = exercise ? progressByExercise.get(exercise.id) : null;
                        const options = familyOptions.get(row.family) ?? [];

                        return (
                          <div className="exercise-table-row" key={row.key}>
                            <div className="exercise-main-cell">
                              {row.subfamily ? <span className="exercise-subfamily">{row.subfamily}</span> : null}
                              <strong>{row.family}</strong>
                            </div>

                        <div className="exercise-variant-cell">
                          <select onChange={(event) => changeRowExercise(row.key, event.target.value)} value={row.exerciseId}>
                                {options.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.variant}
                                  </option>
                                ))}
                              </select>
                              <small>{exercise?.kind ?? "--"}</small>
                            </div>

                            <div className="exercise-series-panel">
                              <div className="exercise-series-grid" style={{ gridTemplateColumns: getSetGridTemplate(row.sets.length) }}>
                                {row.sets.map((setItem, setIndex) => (
                                  <div className="series-slot" key={`${row.key}-set-${setIndex}`}>
                                    <span className="series-label">S{setIndex + 1}</span>
                                    <input
                                      onChange={(event) => updateSetValue(row.key, setIndex, "reps", event.target.value)}
                                      placeholder="reps"
                                      type="number"
                                      value={setItem.reps}
                                    />
                                    <input
                                      onChange={(event) => updateSetValue(row.key, setIndex, "rir", event.target.value)}
                                      placeholder="rir"
                                      type="number"
                                      value={setItem.rir}
                                    />
                                    <input
                                      onChange={(event) => updateSetValue(row.key, setIndex, "weightKg", event.target.value)}
                                      placeholder="kg"
                                      type="number"
                                      value={setItem.weightKg}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="exercise-side-cell">
                                <div className="series-counter">
                                  <strong>{row.sets.length}/5 series</strong>
                                  <div className="series-counter-actions">
                                    <button
                                      className="mini-counter"
                                      disabled={row.sets.length <= 3}
                                      onClick={() => removeSetFromRow(row.key, row.sets.length - 1)}
                                      type="button"
                                    >
                                      -
                                    </button>
                                    <button
                                      className="mini-counter"
                                      disabled={row.sets.length >= 5}
                                      onClick={() => addSetToRow(row.key)}
                                      type="button"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <span className={`progress-chip ${progression?.action?.toLowerCase() ?? "sin_datos"}`}>
                                  {progression?.action ?? "SIN_DATOS"}
                                </span>
                                <p>{progression?.label ?? "Sin datos anteriores"}</p>
                                {progression?.lastWeight !== null ? (
                                  <small>
                                    Ultima: {formatWeight(progression?.lastWeight ?? null)} kg · {progression?.lastReps} reps · RIR{" "}
                                    {progression?.lastRir}
                                  </small>
                                ) : (
                                  <small>Sin datos anteriores</small>
                                )}
                                <small>{getWeightLabel(exercise)}</small>
                                {progression && progression.action !== "SIN_DATOS" ? (
                                  <button className="text-button" onClick={() => applyProgression(row.key)} type="button">
                                    Usar sugerencia
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}

              <div className="template-section">
                <div className="template-section-title dark">EXTRAS</div>
                {draft.rows
                  .filter((row) => row.isExtra)
                  .map((row) => {
                    const exercise = exercisesById.get(Number(row.exerciseId)) ?? null;
                    const rating = getExtraExerciseRating(exercise, dayKind, draft.rows, exercisesById);
                    const progression = exercise ? progressByExercise.get(exercise.id) : null;
                    const ratedOptions = extraExerciseOptions.map((option) => ({
                      option,
                      rating: getExtraExerciseRating(option, dayKind, draft.rows.filter((item) => item.key !== row.key), exercisesById),
                    }));

                    return (
                      <div className="exercise-table-row extra-row" key={row.key}>
                        <div className="exercise-main-cell">
                          <strong>Extra</strong>
                          <span className="exercise-subfamily">Controlado por volumen</span>
                        </div>
                        <div className="exercise-variant-cell">
                          <select onChange={(event) => changeRowExercise(row.key, event.target.value)} value={row.exerciseId}>
                            <option value="">Selecciona un ejercicio</option>
                            {ratedOptions.map(({ option, rating: optionRating }) => (
                              <option key={option.id} value={option.id}>
                                {optionRating ? `${optionRating} ` : ""}{option.base} · {option.variant}
                              </option>
                            ))}
                          </select>
                          <small>{exercise?.muscle_group ?? "--"}</small>
                          <div className="dropdown-rating-legend">
                            {ratedOptions.slice(0, 6).map(({ option, rating: optionRating }) => (
                              <span
                                className={`option-rating ${optionRating?.replaceAll("+", "plus").replaceAll("-", "minus") ?? "neutral"}`}
                                key={`${row.key}-${option.id}`}
                              >
                                {optionRating ?? "--"} {option.base}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="exercise-series-panel">
                          <div className="exercise-series-grid" style={{ gridTemplateColumns: getSetGridTemplate(row.sets.length) }}>
                            {row.sets.map((setItem, setIndex) => (
                              <div className="series-slot" key={`${row.key}-set-${setIndex}`}>
                                <span className="series-label">S{setIndex + 1}</span>
                                <input
                                  onChange={(event) => updateSetValue(row.key, setIndex, "reps", event.target.value)}
                                  placeholder="reps"
                                  type="number"
                                  value={setItem.reps}
                                />
                                <input
                                  onChange={(event) => updateSetValue(row.key, setIndex, "rir", event.target.value)}
                                  placeholder="rir"
                                  type="number"
                                  value={setItem.rir}
                                />
                                <input
                                  onChange={(event) => updateSetValue(row.key, setIndex, "weightKg", event.target.value)}
                                  placeholder="kg"
                                  type="number"
                                  value={setItem.weightKg}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="exercise-side-cell">
                            <div className="series-counter">
                              <strong>{row.sets.length}/5 series</strong>
                              <div className="series-counter-actions">
                                <button
                                  className="mini-counter"
                                  disabled={row.sets.length <= 3}
                                  onClick={() => removeSetFromRow(row.key, row.sets.length - 1)}
                                  type="button"
                                >
                                  -
                                </button>
                                <button
                                  className="mini-counter"
                                  disabled={row.sets.length >= 5}
                                  onClick={() => addSetToRow(row.key)}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <span className={`rating-chip ${rating?.replace("+", "plus").replace("-", "minus") ?? "neutral"}`}>
                              {rating ?? "--"}
                            </span>
                            <p>{rating ? getExtraRatingLabel(rating) : "Elige un extra y te digo como lo valoro."}</p>
                            <small>{progression?.label ?? "Sin sugerencia del ejercicio todavia"}</small>
                            <button className="text-button" onClick={() => removeExtraRow(row.key)} type="button">
                              Quitar extra
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            </div>

            <div className="extra-hints">
              <button className="button secondary" onClick={addExtraRow} type="button">
                Anadir otro ejercicio
              </button>
              {addHints.map((hint) => (
                <div className="extra-hint" key={`${hint.text}-${hint.rating}`}>
                  <span className={`rating-chip ${hint.rating.replace("+", "plus").replace("-", "minus")}`}>{hint.rating}</span>
                  <span>{hint.text}</span>
                </div>
              ))}
            </div>

            <label className="field">
              <span>Notas del dia</span>
              <textarea
                className="textarea"
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="Sensaciones, tecnica o recordatorios"
                value={draft.notes}
              />
            </label>

            <button className="button primary" disabled={saving} onClick={handleCreateSession} type="button">
              {saving ? "Guardando..." : "Guardar dia completo"}
            </button>
          </article>

          <article className="card stack">
            <span className="pill">Reglas activas</span>
            <h2>Como te estoy guiando ahora</h2>
            <div className="suggestion-list">
              <div className="suggestion-card">
                <strong>Progresion del ejercicio</strong>
                <p>
                  Miro la mejor serie de la ultima sesion del mismo ejercicio exacto. Si llegas al maximo
                  o a su equivalente por reps + RIR, te sugiero subir peso.
                </p>
              </div>
              <div className="suggestion-card">
                <strong>Estancamiento</strong>
                <p>
                  Si en 2 sesiones no subes ni kg ni combinacion de reps + RIR, te propongo bajar un poco
                  para volver a progresar.
                </p>
              </div>
              <div className="suggestion-card">
                <strong>Extras</strong>
                <p>
                  `++` y `+` significan que compensa el dia. `-` y `--` avisan de fatiga extra o volumen demasiado alto.
                </p>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "measurements" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Medidas corporales</span>
            <h2>Registrar progreso fisico</h2>
            <div className="grid triple metrics-grid">
              <label className="field">
                <span>Fecha</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, measuredAt: event.target.value })}
                  type="date"
                  value={measurementDraft.measuredAt}
                />
              </label>
              <label className="field">
                <span>Peso kg</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, weightKg: event.target.value })}
                  type="number"
                  value={measurementDraft.weightKg}
                />
              </label>
              <label className="field">
                <span>Grasa corporal %</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, bodyFatPercent: event.target.value })}
                  type="number"
                  value={measurementDraft.bodyFatPercent}
                />
              </label>
              <label className="field">
                <span>Pecho cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, chestCm: event.target.value })}
                  type="number"
                  value={measurementDraft.chestCm}
                />
              </label>
              <label className="field">
                <span>Cintura cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, waistCm: event.target.value })}
                  type="number"
                  value={measurementDraft.waistCm}
                />
              </label>
              <label className="field">
                <span>Cadera cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, hipCm: event.target.value })}
                  type="number"
                  value={measurementDraft.hipCm}
                />
              </label>
              <label className="field">
                <span>Brazo cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, armCm: event.target.value })}
                  type="number"
                  value={measurementDraft.armCm}
                />
              </label>
              <label className="field">
                <span>Muslo cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, thighCm: event.target.value })}
                  type="number"
                  value={measurementDraft.thighCm}
                />
              </label>
            </div>
            <label className="field">
              <span>Notas</span>
              <textarea
                className="textarea"
                onChange={(event) => setMeasurementDraft({ ...measurementDraft, notes: event.target.value })}
                value={measurementDraft.notes}
              />
            </label>
            <button className="button primary" disabled={savingMeasurement} onClick={handleCreateMeasurement} type="button">
              {savingMeasurement ? "Guardando..." : "Guardar medidas"}
            </button>
          </article>

          <article className="card stack">
            <span className="pill">Ultimos registros</span>
            <h2>Tu historial corporal</h2>
            {measurements.length === 0 ? (
              <p>Aun no has registrado medidas corporales.</p>
            ) : (
              measurements.slice(0, 12).map((item) => (
                <div className="session-item" key={item.id}>
                  <strong>{formatDate(item.measured_at)}</strong>
                  <p>
                    Peso {item.weight_kg ?? "--"} kg · Cintura {item.waist_cm ?? "--"} cm · Pecho {item.chest_cm ?? "--"} cm
                  </p>
                  {item.notes ? <p>{item.notes}</p> : null}
                </div>
              ))
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "charts" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Grafica corporal</span>
            <h2>Evolucion del peso</h2>
            {measurementTrend.length < 2 ? (
              <p>Necesitas al menos dos registros de medidas para ver la grafica.</p>
            ) : (
              <div className="chart-shell">
                <svg className="chart-svg" viewBox="0 0 360 180">
                  <path className="chart-line" d={buildLinePath(measurementTrend.map((item) => item.value))} />
                </svg>
                <div className="chart-labels">
                  {measurementTrend.map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}</span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className="card stack">
            <span className="pill">Grafica de carga</span>
            <h2>Volumen por sesion</h2>
            {volumeTrend.length < 2 ? (
              <p>Necesitas al menos dos sesiones para ver una tendencia de carga.</p>
            ) : (
              <div className="chart-shell">
                <svg className="chart-svg" viewBox="0 0 360 180">
                  <path className="chart-line alt" d={buildLinePath(volumeTrend.map((item) => item.value))} />
                </svg>
                <div className="chart-labels">
                  {volumeTrend.map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}</span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className="card stack">
            <span className="pill">RIR</span>
            <h2>Evolucion del RIR medio</h2>
            {rirTrend.length < 2 ? (
              <p>Necesitas al menos dos sesiones para ver la evolucion del RIR medio.</p>
            ) : (
              <div className="chart-shell">
                <svg className="chart-svg" viewBox="0 0 360 180">
                  <path className="chart-line rir" d={buildLinePath(rirTrend.map((item) => item.value))} />
                </svg>
                <div className="chart-labels">
                  {rirTrend.map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      ) : null}
    </main>
  );
}
