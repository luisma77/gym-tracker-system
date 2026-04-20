"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createMeasurement,
  createSession,
  fetchMeasurements,
  fetchDashboard,
  fetchExercises,
  fetchSessions,
  type BodyMeasurement,
  type DashboardSummary,
  type Exercise,
  type WorkoutSession
} from "@/lib/api";
import { clearAuthSession, getAuthToken, getStoredUser } from "@/lib/auth-storage";

type StoredUser = {
  email: string;
  full_name: string;
};

type DashboardTab = "overview" | "workout" | "measurements" | "charts";

type SessionSetDraft = {
  exerciseId: string;
  reps: string;
  rir: string;
  weightKg: string;
};

type SessionDraft = {
  title: string;
  trainingDay: string;
  weekNumber: number;
  notes: string;
  sets: SessionSetDraft[];
};

type MeasurementDraft = {
  measuredAt: string;
  weightKg: string;
  bodyFatPercent: string;
  chestCm: string;
  waistCm: string;
  hipCm: string;
  armCm: string;
  thighCm: string;
  notes: string;
};

const TRAINING_DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const WEEK_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const defaultSetDraft = (): SessionSetDraft => ({
  exerciseId: "",
  reps: "8",
  rir: "2",
  weightKg: "60"
});

const initialDraft: SessionDraft = {
  title: "Sesion de hoy",
  trainingDay: "Lunes",
  weekNumber: 1,
  notes: "",
  sets: [defaultSetDraft(), defaultSetDraft()]
};

const initialMeasurementDraft: MeasurementDraft = {
  measuredAt: "",
  weightKg: "",
  bodyFatPercent: "",
  chestCm: "",
  waistCm: "",
  hipCm: "",
  armCm: "",
  thighCm: "",
  notes: ""
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function buildLinePath(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const height = 180;
  const width = 360;
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function getSessionVolume(session: WorkoutSession) {
  return session.sets.reduce((total, item) => total + item.reps * item.weight_kg, 0);
}

export function DashboardClient() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [draft, setDraft] = useState<SessionDraft>(initialDraft);
  const [measurementDraft, setMeasurementDraft] = useState<MeasurementDraft>(initialMeasurementDraft);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [error, setError] = useState("");

  const groupedExercises = useMemo(() => {
    return exercises.reduce<Record<string, Exercise[]>>((accumulator, exercise) => {
      accumulator[exercise.muscle_group] ??= [];
      accumulator[exercise.muscle_group].push(exercise);
      return accumulator;
    }, {});
  }, [exercises]);

  const latestMeasurement = measurements[0] ?? null;
  const measurementTrend = [...measurements]
    .reverse()
    .filter((item) => item.weight_kg !== null)
    .map((item) => ({ label: formatDate(item.measured_at), value: Number(item.weight_kg) }));
  const volumeTrend = [...sessions]
    .reverse()
    .map((item) => ({ label: formatDate(item.created_at), value: getSessionVolume(item) }));

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getStoredUser<StoredUser>();
    if (!storedToken || !storedUser) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    Promise.all([
      fetchDashboard(storedToken),
      fetchSessions(storedToken),
      fetchExercises(),
      fetchMeasurements(storedToken)
    ])
      .then(([dashboard, sessionItems, exerciseItems, measurementItems]) => {
        setSummary(dashboard);
        setSessions(sessionItems);
        setExercises(exerciseItems);
        setMeasurements(measurementItems);
        setDraft((current) => ({
          ...current,
          sets: current.sets.map((item) => ({
            ...item,
            exerciseId: item.exerciseId || (exerciseItems[0] ? String(exerciseItems[0].id) : "")
          }))
        }));
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "No se han podido cargar los datos.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function refreshData(currentToken: string) {
    const [dashboard, sessionItems, measurementItems] = await Promise.all([
      fetchDashboard(currentToken),
      fetchSessions(currentToken),
      fetchMeasurements(currentToken)
    ]);
    setSummary(dashboard);
    setSessions(sessionItems);
    setMeasurements(measurementItems);
  }

  async function handleCreateSession() {
    if (!token || draft.sets.some((item) => !item.exerciseId)) {
      setError("Necesitas iniciar sesion y elegir un ejercicio en cada serie.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createSession(token, {
        title: draft.title,
        training_day: draft.trainingDay,
        week_number: draft.weekNumber,
        notes: draft.notes,
        sets: draft.sets.map((item) => ({
          exercise_id: Number(item.exerciseId),
          reps: Number(item.reps),
          rir: Number(item.rir),
          weight_kg: Number(item.weightKg)
        }))
      });
      await refreshData(token);
      setDraft((current) => ({
        ...current,
        notes: "",
        sets: current.sets.map((item) => ({ ...item, reps: "8", rir: "2", weightKg: "60" }))
      }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se ha podido guardar la sesion.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateMeasurement() {
    if (!token) {
      setError("Necesitas iniciar sesion para guardar medidas.");
      return;
    }

    setSavingMeasurement(true);
    setError("");
    try {
      await createMeasurement(token, {
        measured_at: measurementDraft.measuredAt || undefined,
        weight_kg: measurementDraft.weightKg ? Number(measurementDraft.weightKg) : undefined,
        body_fat_percent: measurementDraft.bodyFatPercent ? Number(measurementDraft.bodyFatPercent) : undefined,
        chest_cm: measurementDraft.chestCm ? Number(measurementDraft.chestCm) : undefined,
        waist_cm: measurementDraft.waistCm ? Number(measurementDraft.waistCm) : undefined,
        hip_cm: measurementDraft.hipCm ? Number(measurementDraft.hipCm) : undefined,
        arm_cm: measurementDraft.armCm ? Number(measurementDraft.armCm) : undefined,
        thigh_cm: measurementDraft.thighCm ? Number(measurementDraft.thighCm) : undefined,
        notes: measurementDraft.notes || undefined
      });
      await refreshData(token);
      setMeasurementDraft(initialMeasurementDraft);
      setActiveTab("charts");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se han podido guardar las medidas.");
    } finally {
      setSavingMeasurement(false);
    }
  }

  function updateSet(index: number, key: keyof SessionSetDraft, value: string) {
    setDraft((current) => ({
      ...current,
      sets: current.sets.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function addSetRow() {
    setDraft((current) => ({
      ...current,
      sets: [...current.sets, { ...defaultSetDraft(), exerciseId: current.sets[0]?.exerciseId ?? "" }]
    }));
  }

  function removeSetRow(index: number) {
    setDraft((current) => ({
      ...current,
      sets: current.sets.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  if (loading) {
    return (
      <main>
        <section className="hero">
          <span className="eyebrow">Cargando</span>
          <h1>Preparando tu panel de entrenamiento.</h1>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Dashboard</span>
        <h1>{user ? `Hola, ${user.full_name}.` : "Gym Tracker"}</h1>
        <p>
          Unifica entrenamiento, medidas corporales y progreso visual en un mismo panel.
        </p>
        <div className="hero-actions">
          <button className="button secondary" onClick={() => setActiveTab("workout")} type="button">
            Registrar sesion
          </button>
          <button className="button primary" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}

      <section className="grid feature-grid dashboard-stats">
        <article className="card stack">
          <span className="pill">Semana</span>
          <h2>{summary?.current_week ?? 1}</h2>
          <p>Bloque actual: {summary?.block_type ?? "HIP"}</p>
        </article>
        <article className="card stack">
          <span className="pill">Sesiones</span>
          <h2>{summary?.total_sessions ?? 0}</h2>
          <p>Entrenamientos registrados en tu historial.</p>
        </article>
        <article className="card stack">
          <span className="pill">Series</span>
          <h2>{summary?.total_sets ?? 0}</h2>
          <p>Series acumuladas dentro del bloque actual.</p>
        </article>
        <article className="card stack">
          <span className="pill">Peso actual</span>
          <h2>{latestMeasurement?.weight_kg ? `${latestMeasurement.weight_kg} kg` : "--"}</h2>
          <p>{latestMeasurement ? `Ultimo registro: ${formatDate(latestMeasurement.measured_at)}` : "Aun sin medidas guardadas."}</p>
        </article>
      </section>

      <section className="dashboard-tabs">
        {[
          { key: "overview", label: "Vista general" },
          { key: "workout", label: "Entreno" },
          { key: "measurements", label: "Medidas" },
          { key: "charts", label: "Graficas" }
        ].map((tab) => (
          <button
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key as DashboardTab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </section>

      {activeTab === "overview" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Resumen rapido</span>
            <h2>Tu panel central</h2>
            <div className="summary-list">
              <div>
                <strong>Ejercicios disponibles</strong>
                <p>{exercises.length} ejercicios con distintos grupos musculares.</p>
              </div>
              <div>
                <strong>Ultima sesion</strong>
                <p>{sessions[0] ? `${sessions[0].title} · ${sessions[0].training_day}` : "Todavia no has guardado entrenamientos."}</p>
              </div>
              <div>
                <strong>Ultimas medidas</strong>
                <p>
                  {latestMeasurement
                    ? `Peso ${latestMeasurement.weight_kg ?? "--"} kg · cintura ${latestMeasurement.waist_cm ?? "--"} cm`
                    : "Aun no hay medidas corporales registradas."}
                </p>
              </div>
            </div>
          </article>

          <article className="card stack">
            <span className="pill">Historial</span>
            <h2>Ultimas sesiones</h2>
            {sessions.length === 0 ? (
              <p>Aun no hay sesiones guardadas. Registra la primera desde el panel.</p>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div className="session-item" key={session.id}>
                  <strong>{session.title}</strong>
                  <p>
                    {session.training_day} · Semana {session.week_number} · {formatDate(session.created_at)}
                  </p>
                  <p>
                    {session.sets
                      .map(
                        (item) =>
                          `${item.exercise_name}: ${item.weight_kg} kg x ${item.reps} reps (RIR ${item.rir})`
                      )
                      .join(" | ")}
                  </p>
                </div>
              ))
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "workout" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack workout-builder">
            <span className="pill">Nueva sesion</span>
            <h2>Registrar entrenamiento</h2>
            <div className="grid split compact-split">
              <label className="field">
                <span>Titulo</span>
                <input
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  value={draft.title}
                />
              </label>
              <label className="field">
                <span>Dia</span>
                <select
                  onChange={(event) => setDraft({ ...draft, trainingDay: event.target.value })}
                  value={draft.trainingDay}
                >
                  {TRAINING_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Semana del bloque</span>
              <select
                onChange={(event) => setDraft({ ...draft, weekNumber: Number(event.target.value) || 1 })}
                value={draft.weekNumber}
              >
                {WEEK_OPTIONS.map((week) => (
                  <option key={week} value={week}>
                    Semana {week}
                  </option>
                ))}
              </select>
            </label>

            <div className="set-editor-list">
              {draft.sets.map((setItem, index) => (
                <div className="set-editor-row" key={`set-${index}`}>
                  <div className="set-editor-header">
                    <strong>Serie {index + 1}</strong>
                    {draft.sets.length > 1 ? (
                      <button className="text-button" onClick={() => removeSetRow(index)} type="button">
                        Quitar
                      </button>
                    ) : null}
                  </div>
                  <label className="field">
                    <span>Ejercicio</span>
                    <select
                      onChange={(event) => updateSet(index, "exerciseId", event.target.value)}
                      value={setItem.exerciseId}
                    >
                      {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                        <optgroup key={group} label={group}>
                          {groupExercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.name} · {exercise.equipment}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <div className="grid triple">
                    <label className="field">
                      <span>Reps</span>
                      <input
                        onChange={(event) => updateSet(index, "reps", event.target.value)}
                        type="number"
                        value={setItem.reps}
                      />
                    </label>
                    <label className="field">
                      <span>RIR</span>
                      <select onChange={(event) => updateSet(index, "rir", event.target.value)} value={setItem.rir}>
                        {[0, 1, 2, 3, 4, 5].map((rir) => (
                          <option key={rir} value={rir}>
                            {rir}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Peso kg</span>
                      <input
                        onChange={(event) => updateSet(index, "weightKg", event.target.value)}
                        type="number"
                        value={setItem.weightKg}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <button className="button secondary" onClick={addSetRow} type="button">
                Anadir otra serie
              </button>
            </div>

            <label className="field">
              <span>Notas</span>
              <textarea
                className="textarea"
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="Sensaciones, tecnicas, molestias o recordatorios"
                value={draft.notes}
              />
            </label>
            <button className="button primary" disabled={saving} onClick={handleCreateSession} type="button">
              {saving ? "Guardando..." : "Guardar sesion"}
            </button>
          </article>

          <article className="card stack">
            <span className="pill">Catalogo</span>
            <h2>Ejercicios disponibles</h2>
            <div className="exercise-cloud">
              {Object.entries(groupedExercises).map(([group, groupExercises]) => (
                <div className="exercise-group" key={group}>
                  <strong>{group}</strong>
                  <p>{groupExercises.map((exercise) => exercise.name).join(" · ")}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "measurements" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Medidas corporales</span>
            <h2>Registrar progreso fisico</h2>
            <div className="grid triple metrics-grid">
              <label className="field">
                <span>Fecha</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, measuredAt: event.target.value })}
                  type="datetime-local"
                  value={measurementDraft.measuredAt}
                />
              </label>
              <label className="field">
                <span>Peso kg</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, weightKg: event.target.value })}
                  type="number"
                  value={measurementDraft.weightKg}
                />
              </label>
              <label className="field">
                <span>Grasa corporal %</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, bodyFatPercent: event.target.value })}
                  type="number"
                  value={measurementDraft.bodyFatPercent}
                />
              </label>
              <label className="field">
                <span>Pecho cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, chestCm: event.target.value })}
                  type="number"
                  value={measurementDraft.chestCm}
                />
              </label>
              <label className="field">
                <span>Cintura cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, waistCm: event.target.value })}
                  type="number"
                  value={measurementDraft.waistCm}
                />
              </label>
              <label className="field">
                <span>Cadera cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, hipCm: event.target.value })}
                  type="number"
                  value={measurementDraft.hipCm}
                />
              </label>
              <label className="field">
                <span>Brazo cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, armCm: event.target.value })}
                  type="number"
                  value={measurementDraft.armCm}
                />
              </label>
              <label className="field">
                <span>Muslo cm</span>
                <input
                  onChange={(event) => setMeasurementDraft({ ...measurementDraft, thighCm: event.target.value })}
                  type="number"
                  value={measurementDraft.thighCm}
                />
              </label>
            </div>
            <label className="field">
              <span>Notas</span>
              <textarea
                className="textarea"
                onChange={(event) => setMeasurementDraft({ ...measurementDraft, notes: event.target.value })}
                placeholder="Ayunas, despues de entrenar, al despertar, etc."
                value={measurementDraft.notes}
              />
            </label>
            <button
              className="button primary"
              disabled={savingMeasurement}
              onClick={handleCreateMeasurement}
              type="button"
            >
              {savingMeasurement ? "Guardando..." : "Guardar medidas"}
            </button>
          </article>

          <article className="card stack">
            <span className="pill">Historial corporal</span>
            <h2>Ultimos registros</h2>
            {measurements.length === 0 ? (
              <p>Aun no has registrado medidas corporales.</p>
            ) : (
              measurements.slice(0, 8).map((item) => (
                <div className="session-item" key={item.id}>
                  <strong>{formatDate(item.measured_at)}</strong>
                  <p>
                    Peso {item.weight_kg ?? "--"} kg · Cintura {item.waist_cm ?? "--"} cm · Pecho{" "}
                    {item.chest_cm ?? "--"} cm
                  </p>
                  {item.notes ? <p>{item.notes}</p> : null}
                </div>
              ))
            )}
          </article>
        </section>
      ) : null}

      {activeTab === "charts" ? (
        <section className="grid split dashboard-panels">
          <article className="card stack">
            <span className="pill">Grafica corporal</span>
            <h2>Evolucion del peso</h2>
            {measurementTrend.length < 2 ? (
              <p>Necesitas al menos dos registros de medidas para ver la grafica.</p>
            ) : (
              <div className="chart-shell">
                <svg className="chart-svg" viewBox="0 0 360 180">
                  <path className="chart-line" d={buildLinePath(measurementTrend.map((item) => item.value))} />
                </svg>
                <div className="chart-labels">
                  {measurementTrend.map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}</span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className="card stack">
            <span className="pill">Grafica de carga</span>
            <h2>Volumen por sesion</h2>
            {volumeTrend.length < 2 ? (
              <p>Necesitas al menos dos sesiones para ver una tendencia de carga.</p>
            ) : (
              <div className="chart-shell">
                <svg className="chart-svg" viewBox="0 0 360 180">
                  <path className="chart-line alt" d={buildLinePath(volumeTrend.map((item) => item.value))} />
                </svg>
                <div className="chart-labels">
                  {volumeTrend.map((item) => (
                    <span key={`${item.label}-${item.value}`}>{item.label}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      ) : null}
    </main>
  );
}
