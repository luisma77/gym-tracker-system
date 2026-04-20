import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, full_name, password } = body as Record<string, string>;

    if (!email || !username || !full_name || !password) {
      return NextResponse.json(
        { detail: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    const existing = await db.execute({
      sql: "SELECT id, email, username FROM users WHERE email = ? OR username = ?",
      args: [email, username],
    });

    if (existing.rows.length > 0) {
      const row = existing.rows[0] as unknown as { email: string; username: string };
      if (row.email === email) {
        return NextResponse.json(
          { detail: { message: "El email ya esta registrado.", field: "email" } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { detail: { message: "El nombre de usuario ya esta en uso.", field: "username" } },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.execute({
      sql: "INSERT INTO users (email, username, full_name, password_hash) VALUES (?, ?, ?, ?) RETURNING id, email, username, full_name, is_active, created_at",
      args: [email, username, full_name, password_hash],
    });

    const user = result.rows[0] as unknown as {
      id: number;
      email: string;
      username: string;
      full_name: string;
      is_active: number;
      created_at: string;
    };

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
    console.error("Register error:", error);
    return NextResponse.json({ detail: "Error interno del servidor." }, { status: 500 });
  }
}
