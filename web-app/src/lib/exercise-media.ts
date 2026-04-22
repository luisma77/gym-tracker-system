export type ExerciseVisualKind = "anatomy" | "image" | "video";

export type ExerciseVisualProfile = {
  kind: ExerciseVisualKind;
  title: string;
  subtitle: string;
  frontZones: string[];
  backZones: string[];
  muscleGroup: string;
  mediaSrc?: string;
};

type ExerciseVisualInput = {
  base: string;
  variant: string;
  muscle_group: string;
  equipment: string;
};

const profileByMuscleGroup: Record<string, Omit<ExerciseVisualProfile, "title" | "subtitle">> = {
  Pecho: {
    kind: "anatomy",
    frontZones: ["chest"],
    backZones: [],
    muscleGroup: "Pecho",
  },
  Espalda: {
    kind: "anatomy",
    frontZones: [],
    backZones: ["back"],
    muscleGroup: "Espalda",
  },
  Hombros: {
    kind: "anatomy",
    frontZones: ["shoulders"],
    backZones: ["rear-shoulders"],
    muscleGroup: "Hombros",
  },
  Biceps: {
    kind: "anatomy",
    frontZones: ["biceps"],
    backZones: [],
    muscleGroup: "Biceps",
  },
  Triceps: {
    kind: "anatomy",
    frontZones: [],
    backZones: ["triceps"],
    muscleGroup: "Triceps",
  },
  Femoral: {
    kind: "anatomy",
    frontZones: [],
    backZones: ["hamstrings"],
    muscleGroup: "Femoral",
  },
  Cuadriceps: {
    kind: "anatomy",
    frontZones: ["quads"],
    backZones: [],
    muscleGroup: "Cuadriceps",
  },
  Gluteos: {
    kind: "anatomy",
    frontZones: [],
    backZones: ["glutes"],
    muscleGroup: "Gluteos",
  },
  Core: {
    kind: "anatomy",
    frontZones: ["core"],
    backZones: ["lower-back"],
    muscleGroup: "Core",
  },
  Pantorrillas: {
    kind: "anatomy",
    frontZones: ["calves"],
    backZones: ["calves"],
    muscleGroup: "Pantorrillas",
  },
  Antebrazo: {
    kind: "anatomy",
    frontZones: ["forearms"],
    backZones: ["forearms"],
    muscleGroup: "Antebrazo",
  },
  Trapecios: {
    kind: "anatomy",
    frontZones: [],
    backZones: ["traps"],
    muscleGroup: "Trapecios",
  },
  Movilidad: {
    kind: "anatomy",
    frontZones: ["full-body"],
    backZones: ["full-body"],
    muscleGroup: "Movilidad",
  },
  General: {
    kind: "anatomy",
    frontZones: ["full-body"],
    backZones: ["full-body"],
    muscleGroup: "General",
  },
};

export function getExerciseVisualProfile(exercise: ExerciseVisualInput | null): ExerciseVisualProfile {
  if (!exercise) {
    return {
      kind: "anatomy",
      title: "Vista del ejercicio",
      subtitle: "Selecciona un ejercicio para cargar la vista anatómica.",
      frontZones: ["full-body"],
      backZones: ["full-body"],
      muscleGroup: "General",
    };
  }

  const profile = profileByMuscleGroup[exercise.muscle_group] ?? profileByMuscleGroup.General;

  return {
    ...profile,
    title: exercise.base,
    subtitle: `${exercise.variant} · ${exercise.equipment}`,
  };
}
