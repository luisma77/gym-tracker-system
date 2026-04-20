import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

function getBlockType(week: number): string {
  if ([1, 2, 4, 5, 7, 8, 10].includes(week)) return "HIP";
  if ([3, 6, 9, 11].includes(week)) return "FUE";
  if (week === 12) return "DEL";
  return "HIP";
}

type RowLike = Record<string, unknown>;

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    const weekResult = await db.execute({
      sql: "SELECT MAX(week_number) as max_week FROM workout_sessions WHERE user_id = ?",
      args: [user.id],
    });
    const current_week = ((weekResult.rows[0] as unknown as RowLike).max_week as number | null) ?? 1;

    const totalSessionsResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ?",
      args: [user.id],
    });
    const total_sessions = (totalSessionsResult.rows[0] as unknown as RowLike).count as number;

    const totalSetsResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM session_sets ss JOIN workout_sessions ws ON ss.session_id = ws.id WHERE ws.user_id = ?",
      args: [user.id],
    });
    const total_sets = (totalSetsResult.rows[0] as unknown as RowLike).count as number;

    const latestSessionsResult = await db.execute({
      sql: "SELECT id, title, training_day, week_number, notes, created_at FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
      args: [user.id],
    });

    const latest_sessions = await Promise.all(
      latestSessionsResult.rows.map(async (session) => {
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

    return NextResponse.json({
      current_week,
      block_type: getBlockType(current_week),
      total_sessions,
      total_sets,
      latest_sessions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
