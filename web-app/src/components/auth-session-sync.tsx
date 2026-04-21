"use client";

import { useEffect } from "react";

import { clearAuthSession, saveSupabaseSession } from "@/lib/auth-storage";
import { getSupabaseClient } from "@/lib/supabase/client";

export function AuthSessionSync() {
  useEffect(() => {
    const client = getSupabaseClient();

    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        saveSupabaseSession(data.session);
      } else {
        clearAuthSession();
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        saveSupabaseSession(session);
      } else {
        clearAuthSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
