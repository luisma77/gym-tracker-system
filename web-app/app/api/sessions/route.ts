import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

type RowLike = Record<string, unknown>;

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    const sessionsResult = await db.execute({
      sql: "SELECT id, title, training_day, week_number, notes, created_at FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC",
      args: [user.id],
    });

    const sessions = await Promise.all(
      sessionsResult.rows.map(async (session) => {
        const s = session as unknown as RowLike;
        const setsResult = await db.execute({
          sql: `SELECT ss.id, ss.position, ss.reps, ss.rir, ss.weight_kg, e.name as exercise_name
                FROM session_sets ss
                JOIN exercises e ON ss.exercise_id = e.id
                WHERE ss.session_id = ?
                ORDER BY ss.position`,
          args: [s.id as number],
        });
        return { ...s, sets: setsResult.rows.map((r) => r as unknown as RowLike) };
      })
    );

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      title: string;
      training_day: string;
      week_number: number;
      notes?: string;
      sets: Array<{ exercise_id: number; reps: number; rir: number; weight_kg: number }>;
    };

    const { title, training_day, week_number, notes, sets } = body;
    if (!title || !training_day || !week_number || !sets?.length) {
      return NextResponse.json({ detail: "Faltan campos obligatorios." }, { status: 400 });
    }

    const sessionResult = await db.execute({
      sql: "INSERT INTO workout_sessions (user_id, title, training_day, week_number, notes) VALUES (?, ?, ?, ?, ?) RETURNING id, title, training_day, week_number, notes, created_at",
      args: [user.id, title, training_day, week_number, notes ?? null],
    });

    const session = sessionResult.rows[0] as unknown as {
      id: number;
      title: string;
      training_day: string;
      week_number: number;
      notes: string | null;
      created_at: string;
    };

    const insertedSets = await Promise.all(
      sets.map(async (set, index) => {
        const setResult = await db.execute({
          sql: "INSERT INTO session_sets (session_id, exercise_id, position, weight_kg, reps, rir) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, position, reps, rir, weight_kg",
          args: [session.id, set.exercise_id, index, set.weight_kg, set.reps, set.rir],
        });
        const exerciseResult = await db.execute({
          sql: "SELECT name FROM exercises WHERE id = ?",
          args: [set.exercise_id],
        });
        const setRow = setResult.rows[0] as unknown as {
          id: number;
          position: number;
          reps: number;
          rir: number;
          weight_kg: number;
        };
        const exerciseName =
          ((exerciseResult.rows[0] as unknown as RowLike)?.name as string) ?? "";
        return { ...setRow, exercise_name: exerciseName };
      })
    );

    return NextResponse.json({ ...session, sets: insertedSets }, { status: 201 });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
