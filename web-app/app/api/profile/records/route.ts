import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    await db.execute({
      sql: "DELETE FROM workout_sessions WHERE user_id = ?",
      args: [user.id],
    });

    return NextResponse.json({ message: "Todos los registros de entrenamiento han sido eliminados." });
  } catch (error) {
    console.error("Delete records error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
