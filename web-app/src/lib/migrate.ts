import { db } from "./db";

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    training_day TEXT NOT NULL,
    week_number INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS session_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    position INTEGER NOT NULL DEFAULT 0,
    weight_kg REAL NOT NULL,
    reps INTEGER NOT NULL,
    rir INTEGER NOT NULL DEFAULT 2
  )`,
  `CREATE TABLE IF NOT EXISTS body_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    measured_at TEXT DEFAULT (datetime('now')),
    weight_kg REAL,
    body_fat_percent REAL,
    chest_cm REAL,
    waist_cm REAL,
    hip_cm REAL,
    arm_cm REAL,
    thigh_cm REAL,
    notes TEXT
  )`,
];

const defaultExercises = [
  { name: "Sentadilla con barra", muscle_group: "Piernas", equipment: "Barra" },
  { name: "Peso muerto", muscle_group: "Espalda", equipment: "Barra" },
  { name: "Press banca", muscle_group: "Pecho", equipment: "Barra" },
  { name: "Dominadas", muscle_group: "Espalda", equipment: "Barra fija" },
  { name: "Press militar", muscle_group: "Hombros", equipment: "Barra" },
  { name: "Curl de biceps", muscle_group: "Biceps", equipment: "Mancuernas" },
  { name: "Extension triceps polea", muscle_group: "Triceps", equipment: "Polea" },
  { name: "Zancadas", muscle_group: "Piernas", equipment: "Mancuernas" },
  { name: "Remo con barra", muscle_group: "Espalda", equipment: "Barra" },
  { name: "Hip thrust", muscle_group: "Gluteos", equipment: "Barra" },
  { name: "Press inclinado mancuernas", muscle_group: "Pecho", equipment: "Mancuernas" },
  { name: "Elevaciones laterales", muscle_group: "Hombros", equipment: "Mancuernas" },
];

export async function runMigration() {
  for (const sql of migrations) {
    await db.execute(sql);
  }

  const result = await db.execute("SELECT COUNT(*) as count FROM exercises");
  const count = result.rows[0]?.count as number;
  if (count === 0) {
    for (const exercise of defaultExercises) {
      await db.execute({
        sql: "INSERT INTO exercises (name, muscle_group, equipment) VALUES (?, ?, ?)",
        args: [exercise.name, exercise.muscle_group, exercise.equipment],
      });
    }
  }
}
