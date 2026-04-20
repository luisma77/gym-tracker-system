import { NextResponse } from "next/server";
import { runMigration } from "@/lib/migrate";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ detail: "No autorizado." }, { status: 401 });
  }

  try {
    await runMigration();
    return NextResponse.json({ message: "Base de datos inicializada correctamente." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ detail: String(error) }, { status: 500 });
  }
}
