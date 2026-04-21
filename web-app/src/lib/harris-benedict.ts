export type HarrisSex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "athlete";
export type GoalType = "maintain" | "cut" | "aggressive_cut" | "lean_bulk" | "bulk";

export type HarrisDraft = {
  sex: HarrisSex;
  age: string;
  heightCm: string;
  weightKg: string;
  activity: ActivityLevel;
  goal: GoalType;
};

export const initialHarrisDraft: HarrisDraft = {
  sex: "male",
  age: "25",
  heightCm: "175",
  weightKg: "",
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

export function getHarrisBenedictResult(draft: HarrisDraft, fallbackWeightKg: number | null) {
  const age = parseOptionalNumber(draft.age);
  const heightCm = parseOptionalNumber(draft.heightCm);
  const weightKg = parseOptionalNumber(draft.weightKg) ?? fallbackWeightKg;

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
  const proteinPerKg = draft.goal === "aggressive_cut" || draft.goal === "cut" ? 2.2 : 1.8;
  const fatPerKg = 0.8;
  const proteinGrams = weightKg * proteinPerKg;
  const fatGrams = weightKg * fatPerKg;
  const carbGrams = Math.max(0, (targetCalories - proteinGrams * 4 - fatGrams * 9) / 4);

  return {
    age,
    heightCm,
    weightKg,
    activity,
    goal,
    bmr,
    tdee,
    targetCalories,
    bmi,
    minHealthyWeight,
    maxHealthyWeight,
    proteinGrams,
    fatGrams,
    carbGrams,
  };
}
