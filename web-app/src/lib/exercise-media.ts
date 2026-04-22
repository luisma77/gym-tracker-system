export type AnatomyZoneId =
  | "chest"
  | "front-delts"
  | "rear-delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "lats"
  | "traps"
  | "lower-back"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";

export type ExerciseVisualProfile = {
  title: string;
  subtitle: string;
  frontZones: AnatomyZoneId[];
  backZones: AnatomyZoneId[];
  muscleGroup: string;
};

export type AnatomyZoneDefinition = {
  id: AnatomyZoneId;
  label: string;
  side: "front" | "back";
  muscleGroups: string[];
};

type ExerciseVisualInput = {
  base: string;
  variant: string;
  muscle_group: string;
  equipment: string;
};

export const anatomyZones: AnatomyZoneDefinition[] = [
  { id: "chest", label: "Pecho", side: "front", muscleGroups: ["Pecho"] },
  { id: "front-delts", label: "Hombro frontal", side: "front", muscleGroups: ["Hombros"] },
  { id: "rear-delts", label: "Hombro posterior", side: "back", muscleGroups: ["Hombros"] },
  { id: "biceps", label: "Biceps", side: "front", muscleGroups: ["Biceps"] },
  { id: "triceps", label: "Triceps", side: "back", muscleGroups: ["Triceps"] },
  { id: "forearms", label: "Antebrazo", side: "front", muscleGroups: ["Antebrazo"] },
  { id: "core", label: "Core", side: "front", muscleGroups: ["Core"] },
  { id: "lats", label: "Espalda", side: "back", muscleGroups: ["Espalda"] },
  { id: "traps", label: "Trapecio", side: "back", muscleGroups: ["Trapecios"] },
  { id: "lower-back", label: "Lumbar", side: "back", muscleGroups: ["Core", "Femoral"] },
  { id: "glutes", label: "Gluteos", side: "back", muscleGroups: ["Gluteos"] },
  { id: "quads", label: "Cuadriceps", side: "front", muscleGroups: ["Cuadriceps"] },
  { id: "hamstrings", label: "Femoral", side: "back", muscleGroups: ["Femoral"] },
  { id: "calves", label: "Pantorrilla", side: "back", muscleGroups: ["Pantorrillas"] },
];

const zonesByMuscleGroup: Record<string, { front: AnatomyZoneId[]; back: AnatomyZoneId[] }> = {
  Pecho: { front: ["chest"], back: [] },
  Espalda: { front: [], back: ["lats"] },
  Hombros: { front: ["front-delts"], back: ["rear-delts"] },
  Biceps: { front: ["biceps"], back: [] },
  Triceps: { front: [], back: ["triceps"] },
  Antebrazo: { front: ["forearms"], back: [] },
  Core: { front: ["core"], back: ["lower-back"] },
  Trapecios: { front: [], back: ["traps"] },
  Cuadriceps: { front: ["quads"], back: [] },
  Femoral: { front: [], back: ["hamstrings"] },
  Gluteos: { front: [], back: ["glutes"] },
  Pantorrillas: { front: [], back: ["calves"] },
  Movilidad: { front: ["front-delts", "core", "quads"], back: ["lats", "glutes", "hamstrings"] },
  General: { front: ["chest", "core"], back: ["lats", "glutes"] },
};

export function getExerciseVisualProfile(exercise: ExerciseVisualInput | null): ExerciseVisualProfile {
  if (!exercise) {
    return {
      title: "Vista del ejercicio",
      subtitle: "Selecciona un ejercicio para cargar el mapa.",
      frontZones: ["chest", "core"],
      backZones: ["lats", "glutes"],
      muscleGroup: "General",
    };
  }

  const zoneProfile = zonesByMuscleGroup[exercise.muscle_group] ?? zonesByMuscleGroup.General;

  return {
    title: exercise.base,
    subtitle: `${exercise.variant} · ${exercise.equipment}`,
    frontZones: zoneProfile.front,
    backZones: zoneProfile.back,
    muscleGroup: exercise.muscle_group,
  };
}

export function getSelectedMuscleGroups(selectedZones: AnatomyZoneId[]) {
  const groups = new Set<string>();

  selectedZones.forEach((zoneId) => {
    const zone = anatomyZones.find((item) => item.id === zoneId);
    zone?.muscleGroups.forEach((group) => groups.add(group));
  });

  return [...groups];
}
