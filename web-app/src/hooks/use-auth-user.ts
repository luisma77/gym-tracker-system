"use client";

import { useEffect, useState } from "react";

import { getAuthStorageEventName, getStoredUser, mapSupabaseUser, type StoredAuthUser } from "@/lib/auth-storage";
import { getSupabaseClient } from "@/lib/supabase/client";

export function useAuthUser() {
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();

    async function syncFromSupabase() {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!active) {
          return;
        }

        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(getStoredUser<StoredAuthUser>());
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const syncFromStorage = () => {
      if (!active) {
        return;
      }

      setUser(getStoredUser<StoredAuthUser>());
    };

    syncFromSupabase();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("focus", syncFromSupabase);
    window.addEventListener("pageshow", syncFromSupabase);
    window.addEventListener(getAuthStorageEventName(), syncFromStorage);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("focus", syncFromSupabase);
      window.removeEventListener("pageshow", syncFromSupabase);
      window.removeEventListener(getAuthStorageEventName(), syncFromStorage);
    };
  }, []);

  return { user, loading };
}
