import { db } from "./db";
import { seedExercises } from "./exercise-seed";

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

let migrationPromise: Promise<void> | null = null;

export async function runMigration() {
  for (const sql of migrations) {
    await db.execute(sql);
  }

  const existingExercisesResult = await db.execute(
    "SELECT name, equipment FROM exercises"
  );
  const existingSignatures = new Set(
    existingExercisesResult.rows.map((row) => `${row.name as string}||${row.equipment as string}`)
  );

  for (const exercise of seedExercises) {
    const signature = `${exercise.name}||${exercise.equipment}`;
    if (!existingSignatures.has(signature)) {
      await db.execute({
        sql: "INSERT INTO exercises (name, muscle_group, equipment) VALUES (?, ?, ?)",
        args: [exercise.name, exercise.muscle_group, exercise.equipment],
      });
      existingSignatures.add(signature);
    }
  }
}

export function ensureDatabase() {
  if (!migrationPromise) {
    migrationPromise = runMigration().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}
