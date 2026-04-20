import { appConfig } from "@/lib/config";

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
    full_name: string;
    is_active: boolean;
    created_at: string;
  };
};

export type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
};

export type WorkoutSession = {
  id: number;
  title: string;
  training_day: string;
  week_number: number;
  notes: string | null;
  created_at: string;
  sets: Array<{
    id: number;
    position: number;
    reps: number;
    rir: number;
    weight_kg: number;
    exercise_name: string;
  }>;
};

export type DashboardSummary = {
  current_week: number;
  block_type: string;
  total_sessions: number;
  total_sets: number;
  latest_sessions: WorkoutSession[];
};

export type BodyMeasurement = {
  id: number;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  notes: string | null;
};

type ErrorPayload =
  | {
      detail?:
        | string
        | { message?: string; field?: string }
        | Array<{ loc?: Array<string | number>; msg?: string }>;
    }
  | null;

export class ApiRequestError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.fieldErrors = fieldErrors;
  }
}

const fieldLabels: Record<string, string> = {
  email: "Email",
  username: "Nombre de usuario",
  full_name: "Nombre completo",
  password: "Contrasena",
};

function formatErrorPayload(payload: ErrorPayload) {
  if (!payload?.detail) {
    return {
      message: "No se ha podido completar la peticion.",
      fieldErrors: {},
    };
  }

  if (typeof payload.detail === "string") {
    return {
      message: payload.detail,
      fieldErrors: {},
    };
  }

  if (!Array.isArray(payload.detail)) {
    const fieldErrors =
      payload.detail.field && payload.detail.message
        ? { [payload.detail.field]: payload.detail.message }
        : {};
    return {
      message: payload.detail.message ?? "No se ha podido completar la peticion.",
      fieldErrors,
    };
  }

  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const fieldErrors = payload.detail.reduce<Record<string, string>>((accumulator, item) => {
      const field = item.loc?.[item.loc.length - 1];
      if (typeof field === "string" && !accumulator[field]) {
        accumulator[field] = item.msg ?? "valor no valido";
      }
      return accumulator;
    }, {});

    return {
      message: payload.detail
        .map((item) => {
          const field = item.loc?.[item.loc.length - 1];
          const label =
            typeof field === "string"
              ? (fieldLabels[field] ?? field.replaceAll("_", " "))
              : "campo";
          return `${label}: ${item.msg ?? "valor no valido"}`;
        })
        .join(" "),
      fieldErrors,
    };
  }

  return {
    message: "No se ha podido completar la peticion.",
    fieldErrors: {},
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorPayload;
    const formattedError = formatErrorPayload(payload);
    throw new ApiRequestError(formattedError.message, formattedError.fieldErrors);
  }
  return (await response.json()) as T;
}

async function requestWithFriendlyErrors(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new ApiRequestError(
      error instanceof Error
        ? `No se ha podido conectar con el servidor. ${error.message}`
        : "No se ha podido conectar con el servidor."
    );
  }
}

export async function registerUser(payload: {
  email: string;
  username: string;
  full_name: string;
  password: string;
}) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
}

export async function loginUser(payload: { identifier: string; password: string }) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthResponse>(response);
}

export async function fetchExercises() {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/exercises`, {
    cache: "no-store",
  });

  return parseResponse<Exercise[]>(response);
}

export async function fetchDashboard(token: string) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return parseResponse<DashboardSummary>(response);
}

export async function fetchSessions(token: string) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return parseResponse<WorkoutSession[]>(response);
}

export async function createSession(
  token: string,
  payload: {
    title: string;
    training_day: string;
    week_number: number;
    notes?: string;
    sets: Array<{
      exercise_id: number;
      reps: number;
      rir: number;
      weight_kg: number;
    }>;
  }
) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<WorkoutSession>(response);
}

export async function fetchMeasurements(token: string) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/measurements`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return parseResponse<BodyMeasurement[]>(response);
}

export async function createMeasurement(
  token: string,
  payload: {
    measured_at?: string;
    weight_kg?: number;
    body_fat_percent?: number;
    chest_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    arm_cm?: number;
    thigh_cm?: number;
    notes?: string;
  }
) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/measurements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<BodyMeasurement>(response);
}

export async function changePassword(
  token: string,
  current_password: string,
  new_password: string
) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/profile/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ current_password, new_password }),
  });

  return parseResponse<{ message: string }>(response);
}

export async function deleteAllRecords(token: string) {
  const response = await requestWithFriendlyErrors(`${appConfig.apiUrl}/api/profile/records`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseResponse<{ message: string }>(response);
}
