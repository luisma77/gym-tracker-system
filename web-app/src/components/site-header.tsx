"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuthSession } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import { signOutUser } from "@/lib/api";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthUser();
  const isAuthed = Boolean(user);

  async function handleLogout() {
    try {
      await signOutUser();
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">GT</span>
          <div>
            <strong>Gym Tracker</strong>
            <small>PPL web con Supabase</small>
          </div>
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <Link className={pathname === "/" ? "nav-link active" : "nav-link"} href="/">
            Inicio
          </Link>
          {isAuthed ? (
            <>
              <Link className={pathname === "/dashboard" ? "nav-link active" : "nav-link"} href="/dashboard">
                Dashboard
              </Link>
            </>
          ) : null}
          <Link className={pathname === "/privacy" ? "nav-link active" : "nav-link"} href="/privacy">
            Privacidad
          </Link>
        </nav>

        <div className="site-header-actions">
          {isAuthed ? (
            <>
              <Link className="user-chip" href="/settings">
                {user?.full_name ?? user?.username ?? user?.email}
              </Link>
              <button className="button secondary" onClick={handleLogout} type="button">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="button secondary" href="/login">
                Iniciar sesión
              </Link>
              <Link className="button primary" href="/register">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
