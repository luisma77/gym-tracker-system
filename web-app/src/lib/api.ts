import { appConfig } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase/client";

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: string;
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
  id: string;
  title: string;
  training_day: string;
  week_number: number;
  notes: string | null;
  created_at: string;
  sets: Array<{
    id: string;
    exercise_id: number;
    position: number;
    reps: number;
    rir: number;
    weight_kg: number;
    exercise_name: string;
    muscle_group: string;
    equipment: string;
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
  id: string;
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

export type LegalContactPayload = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};

export class ApiRequestError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.fieldErrors = fieldErrors;
  }
}

function ensureEnv() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    throw new ApiRequestError(
      "Falta configurar Supabase. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
}

function supabase() {
  return getSupabaseClient();
}

function db() {
  return supabase() as any;
}

function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

function getAuthCallbackUrl(nextPath = "/dashboard") {
  const origin = getBrowserOrigin();
  return origin ? `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}` : undefined;
}

function isEmailIdentifier(identifier: string) {
  return identifier.includes("@");
}

function getFriendlyError(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError(fallback);
}

async function getUserOrThrow() {
  ensureEnv();
  const {
    data: { user },
    error,
  } = await supabase().auth.getUser();

  if (error) {
    throw new ApiRequestError(error.message);
  }

  if (!user) {
    throw new ApiRequestError("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  }

  return user;
}

async function getSessionOrThrow() {
  ensureEnv();
  const {
    data: { session },
    error,
  } = await supabase().auth.getSession();

  if (error) {
    throw new ApiRequestError(error.message);
  }

  if (!session) {
    throw new ApiRequestError("No hay una sesión activa.");
  }

  return session;
}

async function ensureProfile() {
  const user = await getUserOrThrow();
  const payload = {
    id: user.id,
    email: user.email ?? "",
    full_name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    username:
      typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()
        ? user.user_metadata.username.trim().toLowerCase()
        : null,
  };

  const { error } = await db().from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    const missingUsernameColumn =
      error.message.includes("username") && error.message.toLowerCase().includes("column");

    if (!missingUsernameColumn) {
      throw new ApiRequestError(error.message);
    }

    const fallbackPayload = {
      id: payload.id,
      email: payload.email,
      full_name: payload.full_name,
    };

    const { error: fallbackError } = await db().from("profiles").upsert(fallbackPayload, { onConflict: "id" });
    if (fallbackError) {
      throw new ApiRequestError(fallbackError.message);
    }
  }

  return user;
}

async function resolveLoginEmail(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) {
    throw new ApiRequestError("Introduce tu email o nombre de usuario.");
  }

  if (isEmailIdentifier(normalized)) {
    return normalized;
  }

  const { data, error } = await db().rpc("resolve_login_identifier", {
    login_identifier: normalized,
  });

  if (error) {
    const missingRpc =
      error.message.toLowerCase().includes("function") ||
      error.message.toLowerCase().includes("resolve_login_identifier");

    if (missingRpc) {
      const fallback = await db()
        .from("profiles")
        .select("email")
        .ilike("username", normalized)
        .maybeSingle();

      if (fallback.error) {
        const missingUsernameColumn =
          fallback.error.message.includes("username") &&
          fallback.error.message.toLowerCase().includes("column");

        if (missingUsernameColumn) {
          throw new ApiRequestError(
            "Falta aplicar la migración de Supabase para iniciar sesión con nombre de usuario."
          );
        }

        throw new ApiRequestError(fallback.error.message);
      }

      if (!fallback.data?.email) {
        throw new ApiRequestError("No existe ninguna cuenta con ese email o nombre de usuario.");
      }

      return String(fallback.data.email).trim().toLowerCase();
    }

    throw new ApiRequestError(error.message);
  }

  if (!data) {
    throw new ApiRequestError("No existe ninguna cuenta con ese email o nombre de usuario.");
  }

  return String(data).trim().toLowerCase();
}

function mapExercise(row: {
  id: number;
  base: string;
  variant: string;
  muscle_group: string;
  equipment: string;
}) {
  return {
    id: row.id,
    name: `${row.base} · ${row.variant}`,
    muscle_group: row.muscle_group,
    equipment: row.equipment,
  } satisfies Exercise;
}

function mapWorkoutSession(row: {
  id: string;
  title: string;
  training_day: string;
  week_number: number;
  notes: string | null;
  created_at: string;
  session_sets: Array<{
    id: string;
    exercise_id: number;
    position: number;
    reps: number;
    rir: number;
    weight_kg: number;
    exercise_catalog:
      | {
          base: string;
          variant: string;
          muscle_group: string;
          equipment: string;
        }
      | Array<{
          base: string;
          variant: string;
          muscle_group: string;
          equipment: string;
        }>
      | null;
  }>;
}) {
  return {
    id: row.id,
    title: row.title,
    training_day: row.training_day,
    week_number: row.week_number,
    notes: row.notes,
    created_at: row.created_at,
    sets: (row.session_sets ?? [])
      .sort((left, right) => left.position - right.position)
      .map((setItem) => {
        const exerciseCatalog = Array.isArray(setItem.exercise_catalog)
          ? (setItem.exercise_catalog[0] ?? null)
          : setItem.exercise_catalog;

        return {
          id: setItem.id,
          exercise_id: setItem.exercise_id,
          position: setItem.position,
          reps: setItem.reps,
          rir: setItem.rir,
          weight_kg: Number(setItem.weight_kg),
          exercise_name: exerciseCatalog
            ? `${exerciseCatalog.base} · ${exerciseCatalog.variant}`
            : "Ejercicio",
          muscle_group: exerciseCatalog?.muscle_group ?? "General",
          equipment: exerciseCatalog?.equipment ?? "Accesorio",
        };
      }),
  } satisfies WorkoutSession;
}

export async function registerUser(payload: {
  email: string;
  username: string;
  full_name: string;
  password: string;
}) {
  ensureEnv();
  const redirectTo = getAuthCallbackUrl("/dashboard");

  const { data, error } = await supabase().auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: payload.full_name,
        username: payload.username,
      },
    },
  });

  if (error) {
    throw new ApiRequestError(error.message);
  }

  if (!data.user) {
    throw new ApiRequestError("No se ha podido crear la cuenta.");
  }

  if (!data.session) {
    return {
      access_token: "",
      token_type: "bearer",
      user: {
        id: data.user.id,
        email: data.user.email ?? payload.email,
        username: payload.username,
        full_name: payload.full_name,
        is_active: true,
        created_at: data.user.created_at ?? new Date().toISOString(),
      },
    } satisfies AuthResponse;
  }

  await ensureProfile();
  return {
    access_token: data.session.access_token,
    token_type: data.session.token_type,
    user: {
      id: data.user.id,
      email: data.user.email ?? payload.email,
      username: payload.username,
      full_name: payload.full_name,
      is_active: true,
      created_at: data.user.created_at ?? new Date().toISOString(),
    },
  } satisfies AuthResponse;
}

export async function loginUser(payload: { identifier: string; password: string }) {
  ensureEnv();
  const email = await resolveLoginEmail(payload.identifier);
  const { data, error } = await supabase().auth.signInWithPassword({
    email,
    password: payload.password,
  });

  if (error) {
    throw new ApiRequestError(error.message);
  }

  if (!data.session || !data.user) {
    throw new ApiRequestError("No se ha podido iniciar sesión.");
  }

  await ensureProfile();

  return {
    access_token: data.session.access_token,
    token_type: data.session.token_type,
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      username:
        typeof data.user.user_metadata?.username === "string"
          ? data.user.user_metadata.username
          : data.user.email ?? email,
      full_name:
        typeof data.user.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : data.user.email ?? email,
      is_active: true,
      created_at: data.user.created_at ?? new Date().toISOString(),
    },
  } satisfies AuthResponse;
}

export async function signOutUser() {
  const { error } = await supabase().auth.signOut();
  if (error) {
    throw new ApiRequestError(error.message);
  }
}

export async function signInWithProvider(provider: "google" | "apple") {
  ensureEnv();
  const redirectTo = getAuthCallbackUrl("/dashboard");

  const { data, error } = await supabase().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw new ApiRequestError(
      error.message.includes("provider is not enabled")
        ? `${provider === "google" ? "Google" : "Apple"} no está habilitado todavía en Supabase Auth.`
        : error.message
    );
  }

  return data;
}

export async function fetchProfile() {
  const user = await ensureProfile();
  const { data, error } = await db()
    .from("profiles")
    .select("email, full_name, username, current_week, block_type")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    const missingUsernameColumn =
      error.message.includes("username") && error.message.toLowerCase().includes("column");

    if (!missingUsernameColumn) {
      throw new ApiRequestError(error.message);
    }

    const fallback = await db()
      .from("profiles")
      .select("email, full_name, current_week, block_type")
      .eq("id", user.id)
      .maybeSingle();

    if (fallback.error) {
      throw new ApiRequestError(fallback.error.message);
    }

    return {
      email: fallback.data?.email ?? user.email ?? "",
      full_name:
        fallback.data?.full_name ??
        (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""),
      username:
        typeof user.user_metadata?.username === "string" ? user.user_metadata.username : user.email ?? "",
      current_week: fallback.data?.current_week ?? 1,
      block_type: fallback.data?.block_type ?? "HIP",
    };
  }

  return {
    email: data?.email ?? user.email ?? "",
    full_name:
      data?.full_name ??
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : ""),
    username:
      data?.username ??
      (typeof user.user_metadata?.username === "string" ? user.user_metadata.username : user.email ?? ""),
    current_week: data?.current_week ?? 1,
    block_type: data?.block_type ?? "HIP",
  };
}

export async function updateProfile(payload: { full_name: string; username: string }) {
  const user = await getUserOrThrow();
  const normalizedUsername = payload.username.trim().toLowerCase();
  const fullName = payload.full_name.trim();

  const { data: authData, error: authError } = await supabase().auth.updateUser({
    data: {
      full_name: fullName,
      username: normalizedUsername,
    },
  });

  if (authError) {
    throw new ApiRequestError(authError.message);
  }

  const updatePayload = {
    id: user.id,
    email: authData.user?.email ?? user.email ?? "",
    full_name: fullName,
    username: normalizedUsername,
  };

  const { error } = await db().from("profiles").upsert(updatePayload, { onConflict: "id" });
  if (error) {
    const missingUsernameColumn =
      error.message.includes("username") && error.message.toLowerCase().includes("column");

    if (!missingUsernameColumn) {
      throw new ApiRequestError(error.message);
    }

    const fallback = await db()
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: updatePayload.email,
          full_name: fullName,
        },
        { onConflict: "id" }
      );

    if (fallback.error) {
      throw new ApiRequestError(fallback.error.message);
    }
  }

  return {
    email: updatePayload.email,
    full_name: fullName,
    username: normalizedUsername,
  };
}

export async function fetchExercises() {
  ensureEnv();
  const { data, error } = await db()
    .from("exercise_catalog")
    .select("id, base, variant, muscle_group, equipment")
    .order("muscle_group")
    .order("base")
    .order("variant");

  if (error) {
    throw new ApiRequestError(error.message);
  }

  return (data ?? []).map(mapExercise);
}

export async function fetchSessions(_token?: string) {
  const user = await ensureProfile();
  const { data, error } = await db()
    .from("workout_sessions")
    .select(
      "id, title, training_day, week_number, notes, created_at, session_sets(id, exercise_id, position, reps, rir, weight_kg, exercise_catalog(base, variant, muscle_group, equipment))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiRequestError(error.message);
  }

  return (data ?? []).map((row: any) => mapWorkoutSession(row as Parameters<typeof mapWorkoutSession>[0]));
}

export async function fetchDashboard(_token?: string) {
  const [sessionsResult, profileResult] = await Promise.all([
    fetchSessions(),
    db().from("profiles").select("current_week, block_type").maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new ApiRequestError(profileResult.error.message);
  }

  const totalSets = sessionsResult.reduce(
    (sum: number, session: WorkoutSession) => sum + session.sets.length,
    0
  );
  const latestWeek = sessionsResult[0]?.week_number ?? 1;

  return {
    current_week: profileResult.data?.current_week ?? latestWeek,
    block_type: profileResult.data?.block_type ?? "HIP",
    total_sessions: sessionsResult.length,
    total_sets: totalSets,
    latest_sessions: sessionsResult.slice(0, 3),
  } satisfies DashboardSummary;
}

export async function createSession(
  _token: string,
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
    const user = await ensureProfile();
    const { data: sessionData, error: sessionError } = await db()
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        title: payload.title,
        training_day: payload.training_day,
        week_number: payload.week_number,
        notes: payload.notes ?? null,
      })
      .select("id")
      .single();

    if (sessionError || !sessionData) {
      throw new ApiRequestError(sessionError?.message ?? "No se ha podido crear la sesión.");
    }

    const { error: setError } = await db().from("session_sets").insert(
      payload.sets.map((setItem, index) => ({
        session_id: sessionData.id,
        exercise_id: setItem.exercise_id,
        position: index,
        reps: setItem.reps,
        rir: setItem.rir,
        weight_kg: setItem.weight_kg,
      }))
    );

    if (setError) {
      throw new ApiRequestError(setError.message);
    }

    const sessions = await fetchSessions();
    const created = sessions.find((item: WorkoutSession) => item.id === sessionData.id);
    if (!created) {
      throw new ApiRequestError("La sesión se guardó, pero no se ha podido recargar.");
    }

    return created;
}

export async function fetchMeasurements(_token?: string) {
  const user = await ensureProfile();
  const { data, error } = await db()
    .from("body_measurements")
    .select("id, measured_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, notes")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: false });

  if (error) {
    throw new ApiRequestError(error.message);
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    weight_kg: item.weight_kg === null ? null : Number(item.weight_kg),
    body_fat_percent: item.body_fat_percent === null ? null : Number(item.body_fat_percent),
    chest_cm: item.chest_cm === null ? null : Number(item.chest_cm),
    waist_cm: item.waist_cm === null ? null : Number(item.waist_cm),
    hip_cm: item.hip_cm === null ? null : Number(item.hip_cm),
    arm_cm: item.arm_cm === null ? null : Number(item.arm_cm),
    thigh_cm: item.thigh_cm === null ? null : Number(item.thigh_cm),
  })) as BodyMeasurement[];
}

export async function createMeasurement(
  _token: string,
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
  const user = await ensureProfile();
  const { data, error } = await db()
    .from("body_measurements")
    .insert({
      user_id: user.id,
      measured_at: payload.measured_at ?? new Date().toISOString().slice(0, 10),
      weight_kg: payload.weight_kg ?? null,
      body_fat_percent: payload.body_fat_percent ?? null,
      chest_cm: payload.chest_cm ?? null,
      waist_cm: payload.waist_cm ?? null,
      hip_cm: payload.hip_cm ?? null,
      arm_cm: payload.arm_cm ?? null,
      thigh_cm: payload.thigh_cm ?? null,
      notes: payload.notes ?? null,
    })
    .select("id, measured_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, notes")
    .single();

  if (error || !data) {
    throw new ApiRequestError(error?.message ?? "No se han podido guardar las medidas.");
  }

  return {
    ...data,
    weight_kg: data.weight_kg === null ? null : Number(data.weight_kg),
    body_fat_percent: data.body_fat_percent === null ? null : Number(data.body_fat_percent),
    chest_cm: data.chest_cm === null ? null : Number(data.chest_cm),
    waist_cm: data.waist_cm === null ? null : Number(data.waist_cm),
    hip_cm: data.hip_cm === null ? null : Number(data.hip_cm),
    arm_cm: data.arm_cm === null ? null : Number(data.arm_cm),
    thigh_cm: data.thigh_cm === null ? null : Number(data.thigh_cm),
  } satisfies BodyMeasurement;
}

export async function createLegalContactMessage(payload: LegalContactPayload) {
  ensureEnv();

  const trimmedPayload = {
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  };

  if (!trimmedPayload.full_name || !trimmedPayload.email || !trimmedPayload.subject || !trimmedPayload.message) {
    throw new ApiRequestError("Completa nombre, email, asunto y mensaje.");
  }

  const {
    data: { user },
  } = await supabase().auth.getUser();

  const { error } = await db().from("legal_contact_messages").insert({
    user_id: user?.id ?? null,
    full_name: trimmedPayload.full_name,
    email: trimmedPayload.email,
    subject: trimmedPayload.subject,
    message: trimmedPayload.message,
  });

  if (error) {
    const missingTable =
      error.message.toLowerCase().includes("relation") ||
      error.message.toLowerCase().includes("legal_contact_messages");

    if (missingTable) {
      throw new ApiRequestError(
        "Falta aplicar la migración de Supabase para guardar mensajes legales."
      );
    }

    throw new ApiRequestError(error.message);
  }

  return { message: "Tu mensaje se ha enviado correctamente." };
}

export async function changePassword(_token: string, _current_password: string, new_password: string) {
  const { error } = await supabase().auth.updateUser({ password: new_password });
  if (error) {
    throw new ApiRequestError(error.message);
  }

  return { message: "Contrasena actualizada correctamente." };
}

export async function deleteAllRecords(_token: string) {
  const user = await getUserOrThrow();

  const { error: measurementsError } = await db().from("body_measurements").delete().eq("user_id", user.id);
  if (measurementsError) {
    throw new ApiRequestError(measurementsError.message);
  }

  const { error: sessionsError } = await db().from("workout_sessions").delete().eq("user_id", user.id);
  if (sessionsError) {
    throw new ApiRequestError(sessionsError.message);
  }

  return { message: "Registros eliminados." };
}

export async function deleteOwnAccount() {
  const { error } = await db().rpc("delete_my_account");
  if (error) {
    if (
      error.message.toLowerCase().includes("function") ||
      error.message.toLowerCase().includes("delete_my_account")
    ) {
      throw new ApiRequestError(
        "Falta aplicar la migración de Supabase para borrar la cuenta completa."
      );
    }

    throw new ApiRequestError(error.message);
  }

  return {
    message:
      "Tu cuenta y todos tus datos se han eliminado permanentemente. Podrás registrarte otra vez en el futuro.",
  };
}

export async function syncStoredSession() {
  try {
    const session = await getSessionOrThrow();
    return session.access_token;
  } catch (error) {
    throw getFriendlyError(error, "No se ha podido leer la sesión.");
  }
}
