"use client";

import Link from "next/link";

import { useAuthUser } from "@/hooks/use-auth-user";

export function HomeHeroActions() {
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <div className="hero-actions">
        <span className="button secondary button-ghost">Comprobando sesión...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="hero-actions">
        <Link className="button primary" href="/dashboard">
          Ir al dashboard
        </Link>
        <Link className="button secondary" href="/settings">
          Perfil y ajustes
        </Link>
      </div>
    );
  }

  return (
    <div className="hero-actions">
      <Link className="button primary" href="/register">
        Crear cuenta
      </Link>
      <Link className="button secondary" href="/login">
        Iniciar sesión
      </Link>
    </div>
  );
}
