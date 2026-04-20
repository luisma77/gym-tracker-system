"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { clearAuthSession, getStoredUser } from "@/lib/auth-storage";
import { signOutUser } from "@/lib/api";

type StoredUser = {
  email: string;
  full_name: string;
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const isAuthed = Boolean(user);

  useEffect(() => {
    setUser(getStoredUser<StoredUser>());
  }, [pathname]);

  async function handleLogout() {
    try {
      await signOutUser();
    } finally {
      clearAuthSession();
      setUser(null);
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
              <Link className={pathname === "/settings" ? "nav-link active" : "nav-link"} href="/settings">
                Ajustes
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
              <span className="user-chip">{user?.full_name ?? user?.email}</span>
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
