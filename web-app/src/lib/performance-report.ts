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

export type ExerciseTrend = "up" | "flat" | "down";

export type ExerciseReportRow = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  timesPerformed: number;
  totalSets: number;
  totalVolumeKg: number;
  firstEstimatedRm: number | null;
  latestEstimatedRm: number | null;
  bestEstimatedRm: number | null;
  deltaKg: number | null;
  deltaPercent: number | null;
  trend: ExerciseTrend;
  lastDate: string | null;
};

export type WeeklyExerciseProgress = {
  weekNumber: number;
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  exposures: number;
  totalSets: number;
  totalVolumeKg: number;
  bestEstimatedRm: number | null;
  averageRir: number | null;
};

export type WeeklyOverview = {
  weekNumber: number;
  totalSessions: number;
  totalSets: number;
  totalVolumeKg: number;
  averageRir: number;
};

export type FavoriteExercise = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  timesPerformed: number;
  totalSets: number;
  progressPercent: number;
  progressKg: number;
  reason: string;
};

export type MuscleInsight = {
  muscleGroup: string;
  totalSets: number;
  totalVolumeKg: number;
  reason: string;
};

export type MuscleDistribution = {
  muscleGroup: string;
  totalSets: number;
  totalVolumeKg: number;
  sharePercent: number;
};

export type PersonalRecord = {
  label: string;
  exerciseName: string;
  value: number;
  unit: string;
  date: string;
};

export type ReportRecommendation = {
  title: string;
  message: string;
  tone: "info" | "positive" | "warning";
};

export type PerformanceSnapshot = {
  totalSessions: number;
  totalSets: number;
  totalVolumeKg: number;
  averageSessionVolumeKg: number;
  averageSessionRir: number;
  latestWeightKg: number | null;
  weightDeltaKg: number | null;
  adherenceStreakWeeks: number;
  totalWeeksTracked: number;
  dataReadiness: "muy_baja" | "baja" | "media" | "alta";
  bestImprovement: ExerciseImprovement | null;
  favoriteExercise: FavoriteExercise | null;
  starMuscle: MuscleInsight | null;
  laggingMuscle: MuscleInsight | null;
  personalRecords: {
    heaviestSet: PersonalRecord | null;
    bestEstimatedRm: PersonalRecord | null;
    highestVolumeSession: {
      sessionTitle: string;
      volumeKg: number;
      date: string;
    } | null;
  };
  topImprovements: ExerciseImprovement[];
  exerciseReportRows: ExerciseReportRow[];
  exerciseWeeklyProgress: WeeklyExerciseProgress[];
  weeklyOverview: WeeklyOverview[];
  muscleDistribution: MuscleDistribution[];
  recommendations: ReportRecommendation[];
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

function buildFavoriteExercise(
  sessions: WorkoutSession[],
  improvementsByExerciseId: Map<number, ExerciseImprovement>
) {
  const usage = new Map<
    number,
    {
      exerciseName: string;
      muscleGroup: string;
      timesPerformed: number;
      totalSets: number;
      totalVolumeKg: number;
    }
  >();

  sessions.forEach((session) => {
    const touchedInSession = new Set<number>();

    session.sets.forEach((setItem) => {
      const current = usage.get(setItem.exercise_id) ?? {
        exerciseName: setItem.exercise_name,
        muscleGroup: setItem.muscle_group,
        timesPerformed: 0,
        totalSets: 0,
        totalVolumeKg: 0,
      };

      current.totalSets += 1;
      current.totalVolumeKg += setItem.reps * setItem.weight_kg;
      if (!touchedInSession.has(setItem.exercise_id)) {
        current.timesPerformed += 1;
        touchedInSession.add(setItem.exercise_id);
      }

      usage.set(setItem.exercise_id, current);
    });
  });

  const ranked = [...usage.entries()]
    .map(([exerciseId, item]) => {
      const improvement = improvementsByExerciseId.get(exerciseId);
      const progressPercent = improvement?.deltaPercent ?? 0;
      const progressKg = improvement?.deltaKg ?? 0;
      const score = item.timesPerformed * 10 + item.totalSets * 2 + Math.max(progressPercent, 0);

      return {
        exerciseId,
        exerciseName: item.exerciseName,
        muscleGroup: item.muscleGroup,
        timesPerformed: item.timesPerformed,
        totalSets: item.totalSets,
        totalVolumeKg: item.totalVolumeKg,
        progressPercent,
        progressKg,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);

  const winner = ranked[0];
  if (!winner) {
    return null;
  }

  const reasonParts = [
    `lo registraste ${winner.timesPerformed} veces`,
    `acumulaste ${winner.totalSets} series`,
    `moviste ${winner.totalVolumeKg.toFixed(1)} kg de volumen`,
  ];

  if (winner.progressPercent > 0) {
    reasonParts.push(
      `y además progresó ${winner.progressKg.toFixed(1)} kg de e1RM (${winner.progressPercent.toFixed(1)}%)`
    );
  } else {
    reasonParts.push("y fue el movimiento más repetido de tu historial");
  }

  return {
    exerciseId: winner.exerciseId,
    exerciseName: winner.exerciseName,
    muscleGroup: winner.muscleGroup,
    timesPerformed: winner.timesPerformed,
    totalSets: winner.totalSets,
    progressPercent: winner.progressPercent,
    progressKg: winner.progressKg,
    reason: `Ha sido tu ejercicio favorito porque ${reasonParts.join(", ")}.`,
  } satisfies FavoriteExercise;
}

function buildAdherenceStreakWeeks(sessions: WorkoutSession[]) {
  const uniqueWeeks = [...new Set(sessions.map((session) => session.week_number))].sort((a, b) => b - a);
  if (uniqueWeeks.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < uniqueWeeks.length; index += 1) {
    if (uniqueWeeks[index - 1] - uniqueWeeks[index] === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function buildMuscleInsights(sessions: WorkoutSession[]) {
  const totals = new Map<string, { totalSets: number; totalVolumeKg: number }>();

  sessions.forEach((session) => {
    session.sets.forEach((setItem) => {
      const current = totals.get(setItem.muscle_group) ?? { totalSets: 0, totalVolumeKg: 0 };
      current.totalSets += 1;
      current.totalVolumeKg += setItem.reps * setItem.weight_kg;
      totals.set(setItem.muscle_group, current);
    });
  });

  const ordered = [...totals.entries()]
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      totalSets: data.totalSets,
      totalVolumeKg: data.totalVolumeKg,
    }))
    .sort((left, right) => right.totalSets - left.totalSets || right.totalVolumeKg - left.totalVolumeKg);

  const star = ordered[0]
    ? {
        ...ordered[0],
        reason: `Es tu grupo estrella porque acumula ${ordered[0].totalSets} series y ${ordered[0].totalVolumeKg.toFixed(1)} kg de volumen total.`,
      }
    : null;

  const laggingRaw = [...ordered].sort((left, right) => left.totalSets - right.totalSets || left.totalVolumeKg - right.totalVolumeKg)[0];
  const lagging = laggingRaw
    ? {
        ...laggingRaw,
        reason: `Es el grupo más rezagado porque solo lleva ${laggingRaw.totalSets} series y ${laggingRaw.totalVolumeKg.toFixed(1)} kg acumulados.`,
      }
    : null;

  return {
    starMuscle: star satisfies MuscleInsight | null,
    laggingMuscle: lagging satisfies MuscleInsight | null,
  };
}

function buildMuscleDistribution(sessions: WorkoutSession[]): MuscleDistribution[] {
  const totals = new Map<string, { totalSets: number; totalVolumeKg: number }>();
  let globalSets = 0;

  sessions.forEach((session) => {
    session.sets.forEach((setItem) => {
      globalSets += 1;
      const current = totals.get(setItem.muscle_group) ?? { totalSets: 0, totalVolumeKg: 0 };
      current.totalSets += 1;
      current.totalVolumeKg += setItem.reps * setItem.weight_kg;
      totals.set(setItem.muscle_group, current);
    });
  });

  return [...totals.entries()]
    .map(([muscleGroup, item]) => ({
      muscleGroup,
      totalSets: item.totalSets,
      totalVolumeKg: item.totalVolumeKg,
      sharePercent: globalSets > 0 ? (item.totalSets / globalSets) * 100 : 0,
    }))
    .sort((left, right) => right.sharePercent - left.sharePercent);
}

function buildPersonalRecords(sessions: WorkoutSession[]) {
  let heaviestSet: PersonalRecord | null = null;
  let bestEstimatedRm: PersonalRecord | null = null;
  let highestVolumeSession: { sessionTitle: string; volumeKg: number; date: string } | null = null;

  sessions.forEach((session) => {
    const sessionVolume = getSessionVolume(session);
    if (!highestVolumeSession || sessionVolume > highestVolumeSession.volumeKg) {
      highestVolumeSession = {
        sessionTitle: session.title,
        volumeKg: sessionVolume,
        date: session.created_at,
      };
    }

    session.sets.forEach((setItem) => {
      if (!heaviestSet || setItem.weight_kg > heaviestSet.value) {
        heaviestSet = {
          label: "Serie más pesada",
          exerciseName: setItem.exercise_name,
          value: setItem.weight_kg,
          unit: "kg",
          date: session.created_at,
        };
      }

      const estimated = estimateRm(setItem.weight_kg, setItem.reps, setItem.rir);
      if (!bestEstimatedRm || estimated > bestEstimatedRm.value) {
        bestEstimatedRm = {
          label: "Mejor e1RM",
          exerciseName: setItem.exercise_name,
          value: estimated,
          unit: "kg",
          date: session.created_at,
        };
      }
    });
  });

  return {
    heaviestSet,
    bestEstimatedRm,
    highestVolumeSession,
  };
}

function buildWeeklyOverview(sessions: WorkoutSession[]): WeeklyOverview[] {
  const weekMap = new Map<number, WorkoutSession[]>();

  sessions.forEach((session) => {
    const bucket = weekMap.get(session.week_number) ?? [];
    bucket.push(session);
    weekMap.set(session.week_number, bucket);
  });

  return [...weekMap.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([weekNumber, items]) => {
      const totalSets = items.reduce((sum, session) => sum + session.sets.length, 0);
      const totalVolumeKg = items.reduce((sum, session) => sum + getSessionVolume(session), 0);
      const averageRir = items.length > 0 ? items.reduce((sum, session) => sum + getAverageSessionRir(session), 0) / items.length : 0;

      return {
        weekNumber,
        totalSessions: items.length,
        totalSets,
        totalVolumeKg,
        averageRir,
      };
    });
}

function buildExerciseWeeklyProgress(sessions: WorkoutSession[]): WeeklyExerciseProgress[] {
  const map = new Map<string, WeeklyExerciseProgress>();

  sessions.forEach((session) => {
    const touched = new Set<number>();

    session.sets.forEach((setItem) => {
      const key = `${session.week_number}-${setItem.exercise_id}`;
      const current = map.get(key) ?? {
        weekNumber: session.week_number,
        exerciseId: setItem.exercise_id,
        exerciseName: setItem.exercise_name,
        muscleGroup: setItem.muscle_group,
        exposures: 0,
        totalSets: 0,
        totalVolumeKg: 0,
        bestEstimatedRm: null,
        averageRir: null,
      };

      current.totalSets += 1;
      current.totalVolumeKg += setItem.reps * setItem.weight_kg;
      current.bestEstimatedRm = Math.max(
        current.bestEstimatedRm ?? 0,
        estimateRm(setItem.weight_kg, setItem.reps, setItem.rir)
      );

      const totalRir = (current.averageRir ?? 0) * Math.max(current.totalSets - 1, 0) + setItem.rir;
      current.averageRir = totalRir / current.totalSets;

      if (!touched.has(setItem.exercise_id)) {
        current.exposures += 1;
        touched.add(setItem.exercise_id);
      }

      map.set(key, current);
    });
  });

  return [...map.values()].sort((left, right) => {
    if (left.weekNumber !== right.weekNumber) {
      return left.weekNumber - right.weekNumber;
    }
    return left.exerciseName.localeCompare(right.exerciseName, "es");
  });
}

function buildExerciseReportRows(
  sessions: WorkoutSession[],
  exerciseHistory: Map<number, ExerciseBestPoint[]>
): ExerciseReportRow[] {
  const usage = new Map<
    number,
    {
      exerciseName: string;
      muscleGroup: string;
      timesPerformed: number;
      totalSets: number;
      totalVolumeKg: number;
    }
  >();

  sessions.forEach((session) => {
    const touched = new Set<number>();

    session.sets.forEach((setItem) => {
      const current = usage.get(setItem.exercise_id) ?? {
        exerciseName: setItem.exercise_name,
        muscleGroup: setItem.muscle_group,
        timesPerformed: 0,
        totalSets: 0,
        totalVolumeKg: 0,
      };

      current.totalSets += 1;
      current.totalVolumeKg += setItem.reps * setItem.weight_kg;
      if (!touched.has(setItem.exercise_id)) {
        current.timesPerformed += 1;
        touched.add(setItem.exercise_id);
      }

      usage.set(setItem.exercise_id, current);
    });
  });

  return [...usage.entries()]
    .map(([exerciseId, usageItem]) => {
      const history = exerciseHistory.get(exerciseId) ?? [];
      const firstEstimatedRm = history[0]?.estimatedRm ?? null;
      const latestEstimatedRm = history[history.length - 1]?.estimatedRm ?? null;
      const bestEstimatedRm = history.length > 0 ? Math.max(...history.map((item) => item.estimatedRm)) : null;
      const deltaKg =
        firstEstimatedRm !== null && latestEstimatedRm !== null ? latestEstimatedRm - firstEstimatedRm : null;
      const deltaPercent =
        deltaKg !== null && firstEstimatedRm && firstEstimatedRm > 0 ? (deltaKg / firstEstimatedRm) * 100 : null;

      let trend: ExerciseTrend = "flat";
      if ((deltaPercent ?? 0) > 2) {
        trend = "up";
      } else if ((deltaPercent ?? 0) < -2) {
        trend = "down";
      }

      return {
        exerciseId,
        exerciseName: usageItem.exerciseName,
        muscleGroup: usageItem.muscleGroup,
        timesPerformed: usageItem.timesPerformed,
        totalSets: usageItem.totalSets,
        totalVolumeKg: usageItem.totalVolumeKg,
        firstEstimatedRm,
        latestEstimatedRm,
        bestEstimatedRm,
        deltaKg,
        deltaPercent,
        trend,
        lastDate: history[history.length - 1]?.createdAt ?? null,
      } satisfies ExerciseReportRow;
    })
    .sort((left, right) => {
      const rightDelta = right.deltaPercent ?? Number.NEGATIVE_INFINITY;
      const leftDelta = left.deltaPercent ?? Number.NEGATIVE_INFINITY;
      return rightDelta - leftDelta || right.timesPerformed - left.timesPerformed;
    });
}

function getDataReadiness(totalWeeksTracked: number, totalSessions: number): PerformanceSnapshot["dataReadiness"] {
  if (totalSessions < 3 || totalWeeksTracked < 2) {
    return "muy_baja";
  }
  if (totalSessions < 6 || totalWeeksTracked < 4) {
    return "baja";
  }
  if (totalWeeksTracked < 8) {
    return "media";
  }
  return "alta";
}

function buildRecommendations(input: {
  totalSessions: number;
  totalWeeksTracked: number;
  adherenceStreakWeeks: number;
  favoriteExercise: FavoriteExercise | null;
  bestImprovement: ExerciseImprovement | null;
  laggingMuscle: MuscleInsight | null;
  starMuscle: MuscleInsight | null;
  topImprovements: ExerciseImprovement[];
}) {
  const recommendations: ReportRecommendation[] = [];

  if (input.totalWeeksTracked < 4) {
    recommendations.push({
      title: "Muestra todavía corta",
      tone: "warning",
      message:
        "Con menos de 4 semanas aún es pronto para sacar conclusiones sólidas. Para el siguiente ciclo intenta completar 8-12 semanas seguidas antes de comparar tendencias finas.",
    });
  } else if (input.totalWeeksTracked < 12) {
    recommendations.push({
      title: "Ya se ve tendencia",
      tone: "info",
      message:
        "Ya aparecen señales útiles de evolución, pero un bloque de 12 semanas te dará una lectura mucho más fiable para decidir cambios grandes en la siguiente rutina.",
    });
  } else {
    recommendations.push({
      title: "Bloque suficientemente largo",
      tone: "positive",
      message:
        "Tienes un bloque largo y útil para tomar decisiones. Ya puedes revisar qué ejercicios mantener, cuáles variar y qué músculos necesitan más frecuencia o volumen.",
    });
  }

  if (input.favoriteExercise && input.bestImprovement && input.favoriteExercise.exerciseId === input.bestImprovement.exerciseId) {
    recommendations.push({
      title: "Ejercicio muy rentable",
      tone: "positive",
      message: `Tu favorito (${input.favoriteExercise.exerciseName}) además es el que mejor ha progresado. Mantener su familia en el siguiente bloque parece una decisión inteligente.`,
    });
  }

  if (input.laggingMuscle) {
    recommendations.push({
      title: "Grupo a vigilar",
      tone: "warning",
      message: `${input.laggingMuscle.muscleGroup} aparece como grupo rezagado. En la siguiente rutina puedes probar más frecuencia efectiva, algo más de series o una variante que toleres mejor.`,
    });
  }

  if (input.starMuscle) {
    recommendations.push({
      title: "Lo que mejor estás sosteniendo",
      tone: "info",
      message: `${input.starMuscle.muscleGroup} está recibiendo más trabajo útil que el resto. Úsalo como referencia para repartir mejor el volumen de otros grupos.`,
    });
  }

  if (input.adherenceStreakWeeks >= 6) {
    recommendations.push({
      title: "Adherencia sólida",
      tone: "positive",
      message: `Llevas ${input.adherenceStreakWeeks} semanas consecutivas registrando. Esa constancia ya permite comparar marcas y ajustar la rutina con bastante criterio.`,
    });
  }

  if (input.topImprovements.length === 0) {
    recommendations.push({
      title: "Repite más ejercicios clave",
      tone: "warning",
      message:
        "Todavía faltan exposiciones repetidas del mismo ejercicio para medir progreso real. Conviene mantener más estables algunos básicos del bloque.",
    });
  }

  return recommendations;
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
  const improvementsByExerciseId = new Map(topImprovements.map((item) => [item.exerciseId, item]));
  const favoriteExercise = buildFavoriteExercise(sessions, improvementsByExerciseId);
  const adherenceStreakWeeks = buildAdherenceStreakWeeks(sessions);
  const { starMuscle, laggingMuscle } = buildMuscleInsights(sessions);
  const personalRecords = buildPersonalRecords(sessions);
  const weeklyOverview = buildWeeklyOverview(sessions);
  const exerciseWeeklyProgress = buildExerciseWeeklyProgress(sessions);
  const exerciseReportRows = buildExerciseReportRows(sessions, exerciseHistory);
  const muscleDistribution = buildMuscleDistribution(sessions);
  const totalWeeksTracked = weeklyOverview.length;
  const dataReadiness = getDataReadiness(totalWeeksTracked, sessions.length);
  const recommendations = buildRecommendations({
    totalSessions: sessions.length,
    totalWeeksTracked,
    adherenceStreakWeeks,
    favoriteExercise,
    bestImprovement,
    laggingMuscle,
    starMuscle,
    topImprovements,
  });

  return {
    totalSessions: sessions.length,
    totalSets,
    totalVolumeKg,
    averageSessionVolumeKg,
    averageSessionRir,
    latestWeightKg,
    weightDeltaKg,
    adherenceStreakWeeks,
    totalWeeksTracked,
    dataReadiness,
    bestImprovement,
    favoriteExercise,
    starMuscle,
    laggingMuscle,
    personalRecords,
    topImprovements: topImprovements.slice(0, 8),
    exerciseReportRows,
    exerciseWeeklyProgress,
    weeklyOverview,
    muscleDistribution,
    recommendations,
    weightTrend,
    sessionVolumeTrend,
    sessionRirTrend,
    sessionFrequencyTrend: buildSessionFrequencyTrend(sessions),
    topExerciseTrend: bestImprovement?.history ?? [],
  };
}
