export type HarrisSex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "athlete";
export type GoalType = "maintain" | "cut" | "aggressive_cut" | "lean_bulk" | "bulk";

export type HarrisDraft = {
  sex: HarrisSex;
  age: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  activity: ActivityLevel;
  goal: GoalType;
};

export const initialHarrisDraft: HarrisDraft = {
  sex: "male",
  age: "25",
  heightCm: "175",
  weightKg: "",
  waistCm: "",
  activity: "moderate",
  goal: "maintain",
};

export const ACTIVITY_OPTIONS: Array<{ value: ActivityLevel; label: string; factor: number }> = [
  { value: "sedentary", label: "Sedentario", factor: 1.2 },
  { value: "light", label: "Ligero 1-3 dias", factor: 1.375 },
  { value: "moderate", label: "Moderado 3-5 dias", factor: 1.55 },
  { value: "high", label: "Alto 6-7 dias", factor: 1.725 },
  { value: "athlete", label: "Muy alto / doble sesion", factor: 1.9 },
];

export const GOAL_OPTIONS: Array<{ value: GoalType; label: string; delta: number }> = [
  { value: "maintain", label: "Mantener", delta: 0 },
  { value: "cut", label: "Definicion suave", delta: -300 },
  { value: "aggressive_cut", label: "Definicion agresiva", delta: -500 },
  { value: "lean_bulk", label: "Volumen limpio", delta: 250 },
  { value: "bulk", label: "Volumen", delta: 400 },
];

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getProteinPerKg(draft: HarrisDraft) {
  const sexBase = draft.sex === "male" ? 1.7 : 1.6;
  const activityAdjustments: Record<ActivityLevel, number> = {
    sedentary: -0.05,
    light: 0,
    moderate: 0.1,
    high: 0.2,
    athlete: 0.25,
  };
  const goalAdjustments: Record<GoalType, number> = {
    maintain: 0,
    cut: 0.2,
    aggressive_cut: 0.3,
    lean_bulk: 0.05,
    bulk: 0,
  };

  return clamp(sexBase + activityAdjustments[draft.activity] + goalAdjustments[draft.goal], 1.3, 2);
}

function getFatPerKg(draft: HarrisDraft) {
  const sexBase = draft.sex === "male" ? 0.75 : 0.85;
  const activityAdjustments: Record<ActivityLevel, number> = {
    sedentary: -0.05,
    light: 0,
    moderate: -0.02,
    high: -0.05,
    athlete: -0.08,
  };
  const goalAdjustments: Record<GoalType, number> = {
    maintain: 0,
    cut: -0.05,
    aggressive_cut: -0.1,
    lean_bulk: -0.03,
    bulk: 0,
  };

  return clamp(sexBase + activityAdjustments[draft.activity] + goalAdjustments[draft.goal], 0.6, 1);
}

function getCarbFocus(activity: ActivityLevel, goal: GoalType) {
  if (activity === "athlete" || activity === "high") {
    return "Prioriza carbohidratos alrededor del entrenamiento para rendimiento, bombeo muscular y reposicion de glucogeno.";
  }
  if (activity === "moderate") {
    return goal === "cut" || goal === "aggressive_cut"
      ? "Mantén carbohidratos suficientes para rendir bien; recorta calorías sin vaciar demasiado el musculo."
      : "Usa una base media de carbohidratos para entrenar con energia y recuperarte bien.";
  }
  if (activity === "light") {
    return "Puedes usar una cantidad moderada de carbohidratos y concentrarlos en las horas cercanas al entreno.";
  }
  return "Si tu actividad es baja, puedes reducir carbohidratos con mas margen, pero sin recortar de forma agresiva si quieres conservar rendimiento.";
}

function getFatFocus(goal: GoalType) {
  if (goal === "aggressive_cut" || goal === "cut") {
    return "La grasa dietética se mantiene contenida para dejar espacio a proteína alta y carbohidrato útil.";
  }
  if (goal === "lean_bulk" || goal === "bulk") {
    return "La grasa se mantiene suficiente, pero sin desplazar demasiados carbohidratos si entrenas fuerte.";
  }
  return "La grasa queda en un punto medio para sostener salud hormonal y saciedad.";
}

function getRelativeFatMass(sex: HarrisSex, heightCm: number, waistCm: number) {
  if (!waistCm) {
    return null;
  }

  return sex === "male" ? 64 - 20 * (heightCm / waistCm) : 76 - 20 * (heightCm / waistCm);
}

function getWaistToHeightMessage(ratio: number | null) {
  if (ratio === null) {
    return "Sin cintura registrada todavía.";
  }
  if (ratio < 0.5) {
    return "Relacion cintura-altura favorable.";
  }
  if (ratio < 0.6) {
    return "Relacion cintura-altura a vigilar.";
  }
  return "Relacion cintura-altura alta; conviene vigilar grasa central.";
}

export function getHarrisBenedictResult(draft: HarrisDraft, fallbackWeightKg: number | null, fallbackWaistCm: number | null) {
  const age = parseOptionalNumber(draft.age);
  const heightCm = parseOptionalNumber(draft.heightCm);
  const weightKg = parseOptionalNumber(draft.weightKg) ?? fallbackWeightKg;
  const waistCm = parseOptionalNumber(draft.waistCm) ?? fallbackWaistCm;

  if (!age || !heightCm || !weightKg) {
    return null;
  }

  const activity = ACTIVITY_OPTIONS.find((item) => item.value === draft.activity) ?? ACTIVITY_OPTIONS[2];
  const goal = GOAL_OPTIONS.find((item) => item.value === draft.goal) ?? GOAL_OPTIONS[0];
  const bmr =
    draft.sex === "male"
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  const tdee = bmr * activity.factor;
  const targetCalories = tdee + goal.delta;
  const bmi = weightKg / (heightCm / 100) ** 2;
  const minHealthyWeight = 18.5 * (heightCm / 100) ** 2;
  const maxHealthyWeight = 24.9 * (heightCm / 100) ** 2;
  const proteinPerKg = getProteinPerKg(draft);
  const fatPerKg = getFatPerKg(draft);
  const proteinGrams = weightKg * proteinPerKg;
  const fatGrams = weightKg * fatPerKg;
  const carbGrams = Math.max(0, (targetCalories - proteinGrams * 4 - fatGrams * 9) / 4);
  const bodyFatPercentEstimate = waistCm ? clamp(getRelativeFatMass(draft.sex, heightCm, waistCm) ?? 0, 3, 70) : null;
  const fatMassKg = bodyFatPercentEstimate !== null ? weightKg * (bodyFatPercentEstimate / 100) : null;
  const leanMassKg = fatMassKg !== null ? weightKg - fatMassKg : null;
  const waistToHeightRatio = waistCm ? waistCm / heightCm : null;

  return {
    age,
    heightCm,
    weightKg,
    waistCm,
    activity,
    goal,
    bmr,
    tdee,
    targetCalories,
    bmi,
    minHealthyWeight,
    maxHealthyWeight,
    proteinPerKg,
    proteinGrams,
    fatPerKg,
    fatGrams,
    carbGrams,
    bodyFatPercentEstimate,
    fatMassKg,
    leanMassKg,
    waistToHeightRatio,
    guidance: {
      proteinRange: "Rango recomendado de referencia: 1,3 a 2,0 g/kg/dia.",
      carbsFocus: getCarbFocus(draft.activity, draft.goal),
      fatFocus: getFatFocus(draft.goal),
      bodyFatEstimate:
        "Estimacion orientativa basada en cintura, altura y sexo. Puede desviarse por distribucion de grasa, retencion, postura o errores de medida.",
      waistToHeight: getWaistToHeightMessage(waistToHeightRatio),
    },
  };
}
