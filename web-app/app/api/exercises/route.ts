import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.execute("SELECT id, name, muscle_group, equipment FROM exercises ORDER BY muscle_group, name");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Exercises error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
