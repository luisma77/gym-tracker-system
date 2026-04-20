import { createClient } from "@supabase/supabase-js";

import { appConfig } from "@/lib/config";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    throw new Error("Supabase no está configurado.");
  }

  if (!browserClient) {
    browserClient = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}
