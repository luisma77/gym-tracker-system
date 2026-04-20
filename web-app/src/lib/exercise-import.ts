export type ExerciseCatalogEntry = {
  base: string;
  variant: string;
  kind: string;
  excelName: string;
};

type ExerciseRow = [string, string, string];

export function slugifyExerciseName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCatalogFromRows(rows: Array<string[]>) {
  const seen = new Set<string>();
  const catalog: ExerciseCatalogEntry[] = [];

  rows.forEach((row) => {
    const [rawBase = "", rawVariant = "", rawKind = ""] = row as ExerciseRow;
    const base = rawBase.trim();
    const variant = rawVariant.trim();
    const kind = rawKind.trim();

    if (!base || !variant || !kind) {
      return;
    }

    const signature = `${base}||${variant}||${kind}`;
    if (seen.has(signature)) {
      return;
    }

    catalog.push({
      base,
      variant,
      kind,
      excelName: slugifyExerciseName(base),
    });
    seen.add(signature);
  });

  return catalog;
}
