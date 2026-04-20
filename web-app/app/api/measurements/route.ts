import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT id, measured_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, notes FROM body_measurements WHERE user_id = ? ORDER BY measured_at DESC",
      args: [user.id],
    });
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Measurements GET error:", error);
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
      measured_at?: string;
      weight_kg?: number;
      body_fat_percent?: number;
      chest_cm?: number;
      waist_cm?: number;
      hip_cm?: number;
      arm_cm?: number;
      thigh_cm?: number;
      notes?: string;
    };

    const result = await db.execute({
      sql: `INSERT INTO body_measurements
            (user_id, measured_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, measured_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, notes`,
      args: [
        user.id,
        body.measured_at ?? null,
        body.weight_kg ?? null,
        body.body_fat_percent ?? null,
        body.chest_cm ?? null,
        body.waist_cm ?? null,
        body.hip_cm ?? null,
        body.arm_cm ?? null,
        body.thigh_cm ?? null,
        body.notes ?? null,
      ],
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Measurements POST error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
