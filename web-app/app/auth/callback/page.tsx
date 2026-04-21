"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { clearAuthSession, saveSupabaseSession } from "@/lib/auth-storage";
import { getSupabaseClient } from "@/lib/supabase/client";

function buildRedirectTarget(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/dashboard";
  }

  return nextPath;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Estamos cerrando tu acceso y preparando la sesión...");
  const [error, setError] = useState("");
  const nextTarget = useMemo(() => buildRedirectTarget(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    let active = true;

    async function finishAuthFlow() {
      const client = getSupabaseClient();
      const code = searchParams.get("code");

      try {
        if (code) {
          const exchange = await client.auth.exchangeCodeForSession(code);
          if (exchange.error) {
            throw exchange.error;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error("No se ha podido recuperar la sesión después de confirmar el acceso.");
        }

        saveSupabaseSession(session);
        if (!active) {
          return;
        }

        setMessage("Acceso confirmado. Te estamos redirigiendo...");
        router.replace(nextTarget);
        router.refresh();
      } catch (authError) {
        clearAuthSession();
        if (!active) {
          return;
        }

        setError(
          authError instanceof Error
            ? authError.message
            : "No se ha podido completar la validación del acceso."
        );
      }
    }

    finishAuthFlow();

    return () => {
      active = false;
    };
  }, [nextTarget, router, searchParams]);

  return (
    <main>
      <section className="auth-shell">
        <article className="card auth-card stack">
          <span className="pill">Acceso</span>
          <h1>Confirmando tu acceso</h1>
          <p>{message}</p>
          {error ? <p className="feedback error">{error}</p> : null}
        </article>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
