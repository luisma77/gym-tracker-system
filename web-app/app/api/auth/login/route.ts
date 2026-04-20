import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body as { identifier: string; password: string };

    if (!identifier || !password) {
      return NextResponse.json(
        { detail: "Identificador y contrasena son obligatorios." },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "SELECT id, email, username, full_name, password_hash, is_active, created_at FROM users WHERE email = ? OR username = ?",
      args: [identifier, identifier],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ detail: "Credenciales incorrectas." }, { status: 401 });
    }

    const user = result.rows[0] as unknown as {
      id: number;
      email: string;
      username: string;
      full_name: string;
      password_hash: string;
      is_active: number;
      created_at: string;
    };

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: "Credenciales incorrectas." }, { status: 401 });
    }

    const token = await signToken({
      sub: String(user.id),
      email: user.email,
      username: user.username,
    });

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        is_active: user.is_active === 1,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
