import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json() as { current_password: string; new_password: string };
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json({ detail: "Ambas contrasenas son obligatorias." }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT password_hash FROM users WHERE id = ?",
      args: [user.id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ detail: "Usuario no encontrado." }, { status: 404 });
    }

    const { password_hash } = result.rows[0] as unknown as { password_hash: string };
    const valid = await bcrypt.compare(current_password, password_hash);
    if (!valid) {
      return NextResponse.json({ detail: "La contrasena actual no es correcta." }, { status: 400 });
    }

    const new_hash = await bcrypt.hash(new_password, 10);
    await db.execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [new_hash, user.id],
    });

    return NextResponse.json({ message: "Contrasena actualizada correctamente." });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
