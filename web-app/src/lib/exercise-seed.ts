import { exerciseCatalog } from "./exercise-catalog";

export type SeedExercise = {
  name: string;
  muscle_group: string;
  equipment: string;
  kind: string;
  base: string;
  variant: string;
  excel_name: string;
};

const equipmentLabels: Record<string, string> = {
  disco: "Disco",
  mancuerna: "Mancuernas",
  peso_corporal: "Peso corporal",
  polea: "Polea",
};

const muscleGroupRules: Array<{ match: RegExp; group: string }> = [
  { match: /Aperturas|Press Plano|Press Inclinado|Press Polea|Lagartija|Fondos/i, group: "Pecho" },
  { match: /Dominadas|Jalon|Pulldown|Remo|Peso Muerto Parcial/i, group: "Espalda" },
  { match: /Elevaciones Laterales|Elevaciones Posteriores|Pajaro|Peck Deck Invertida|Face Pull|Band Pull-Apart|Press Militar/i, group: "Hombros" },
  { match: /Curl Biceps|Curl Martillo/i, group: "Biceps" },
  { match: /Extension Triceps|JM Press|Skullcrusher/i, group: "Triceps" },
  { match: /Curl Femoral|Curl Rumano|Hiperextension/i, group: "Femoral" },
  { match: /Sentadilla|Prensa Pierna|Extension Cuadriceps/i, group: "Cuadriceps" },
  { match: /Hip Circle/i, group: "Gluteos" },
  { match: /Crunch|Elevacion Piernas|Plancha|Rueda Abdominal|Rotacion|Perro/i, group: "Core" },
  { match: /Elevacion Gemelo|Elevacion Talones/i, group: "Pantorrillas" },
  { match: /Curl Muneca/i, group: "Antebrazo" },
  { match: /Encogimientos|Farmer Carry/i, group: "Trapecios" },
  { match: /Estiramiento/i, group: "Movilidad" },
];

function inferMuscleGroup(base: string) {
  const match = muscleGroupRules.find((rule) => rule.match.test(base));
  return match?.group ?? "General";
}

function getEquipmentLabel(kind: string) {
  return equipmentLabels[kind] ?? "Accesorio";
}

function buildExerciseName(base: string, variant: string) {
  return `${base} · ${variant}`;
}

export const seedExercises: SeedExercise[] = exerciseCatalog
  .map((item) => ({
    name: buildExerciseName(item.base, item.variant),
    muscle_group: inferMuscleGroup(item.base),
    equipment: getEquipmentLabel(item.kind),
    kind: item.kind,
    base: item.base,
    variant: item.variant,
    excel_name: item.excelName,
  }))
  .sort((left, right) => {
    if (left.muscle_group !== right.muscle_group) {
      return left.muscle_group.localeCompare(right.muscle_group, "es");
    }
    return left.name.localeCompare(right.name, "es");
  });

export const seedExerciseSignatureSet = new Set(
  seedExercises.map((item) => `${item.name}||${item.equipment}`)
);
