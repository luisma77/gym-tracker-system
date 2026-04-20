import fs from "node:fs/promises";
import path from "node:path";
import xlsx from "xlsx";

const workbookPath = path.resolve("../excel/Gym_Tracker.xlsx");
const outputPath = path.resolve("./src/lib/exercise-catalog.ts");
const seedOutputPath = path.resolve("./supabase/seed.sql");
const workbook = xlsx.readFile(workbookPath);
const rows = xlsx.utils.sheet_to_json(workbook.Sheets.EJERCICIOS, { header: 1, defval: "" });

function slugifyExerciseName(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const equipmentLabels = {
  disco: "Disco",
  mancuerna: "Mancuernas",
  peso_corporal: "Peso corporal",
  polea: "Polea",
};

const muscleGroupRules = [
  [/Aperturas|Press Plano|Press Inclinado|Press Polea|Lagartija|Fondos/i, "Pecho"],
  [/Dominadas|Jalon|Pulldown|Remo|Peso Muerto Parcial/i, "Espalda"],
  [/Elevaciones Laterales|Elevaciones Posteriores|Pajaro|Peck Deck Invertida|Face Pull|Band Pull-Apart|Press Militar/i, "Hombros"],
  [/Curl Biceps|Curl Martillo/i, "Biceps"],
  [/Extension Triceps|JM Press|Skullcrusher/i, "Triceps"],
  [/Curl Femoral|Curl Rumano|Hiperextension/i, "Femoral"],
  [/Sentadilla|Prensa Pierna|Extension Cuadriceps/i, "Cuadriceps"],
  [/Hip Circle/i, "Gluteos"],
  [/Crunch|Elevacion Piernas|Plancha|Rueda Abdominal|Rotacion|Perro/i, "Core"],
  [/Elevacion Gemelo|Elevacion Talones/i, "Pantorrillas"],
  [/Curl Muneca/i, "Antebrazo"],
  [/Encogimientos|Farmer Carry/i, "Trapecios"],
  [/Estiramiento/i, "Movilidad"],
];

function inferMuscleGroup(base) {
  const rule = muscleGroupRules.find(([regex]) => regex.test(base));
  return rule?.[1] ?? "General";
}

const seen = new Set();
const entries = [];

for (const row of rows.slice(2)) {
  const base = String(row[1] ?? "").trim();
  const variant = String(row[2] ?? "").trim();
  const kind = String(row[3] ?? "").trim();
  const excelName = String(row[4] ?? "").trim() || slugifyExerciseName(base);

  if (!base || !variant || !kind) {
    continue;
  }

  const signature = `${base}||${variant}||${kind}`;
  if (seen.has(signature)) {
    continue;
  }

  entries.push({ base, variant, kind, excelName });
  seen.add(signature);
}

const contents = `export type ExerciseCatalogEntry = {
  base: string;
  variant: string;
  kind: string;
  excelName: string;
};

export const exerciseCatalog: ExerciseCatalogEntry[] = ${JSON.stringify(entries, null, 2)};
`;

const seedStatements = entries.map((entry) => {
  const base = entry.base.replaceAll("'", "''");
  const variant = entry.variant.replaceAll("'", "''");
  const kind = entry.kind.replaceAll("'", "''");
  const excelName = entry.excelName.replaceAll("'", "''");
  const muscleGroup = inferMuscleGroup(entry.base).replaceAll("'", "''");
  const equipment = (equipmentLabels[entry.kind] ?? "Accesorio").replaceAll("'", "''");
  return `insert into public.exercise_catalog (base, variant, kind, excel_name, muscle_group, equipment)
values ('${base}', '${variant}', '${kind}', '${excelName}', '${muscleGroup}', '${equipment}')
on conflict (base, variant, kind) do update
set excel_name = excluded.excel_name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment;`;
});

await fs.writeFile(outputPath, contents, "utf8");
await fs.writeFile(seedOutputPath, `${seedStatements.join("\n\n")}\n`, "utf8");
console.log(`Exported ${entries.length} exercises to ${outputPath}`);
