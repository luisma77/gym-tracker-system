import type { Session, User } from "@supabase/supabase-js";

const authTokenKey = "gym-tracker-token";
const authUserKey = "gym-tracker-user";
const authStorageEvent = "gym-tracker-auth-storage";

export type StoredAuthUser = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export function mapSupabaseUser(user: User): StoredAuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    username:
      typeof user.user_metadata?.username === "string" && user.user_metadata.username.trim()
        ? user.user_metadata.username.trim()
        : user.email ?? "",
    full_name:
      typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : user.email ?? "",
    is_active: true,
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

export function saveAuthSession(token: string, user: unknown) {
  window.localStorage.setItem(authTokenKey, token);
  window.localStorage.setItem(authUserKey, JSON.stringify(user));
  window.dispatchEvent(new Event(authStorageEvent));
}

export function saveSupabaseSession(session: Session) {
  saveAuthSession(session.access_token, mapSupabaseUser(session.user));
}

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey);
}

export function getStoredUser<T>() {
  const raw = window.localStorage.getItem(authUserKey);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearAuthSession() {
  window.localStorage.removeItem(authTokenKey);
  window.localStorage.removeItem(authUserKey);
  window.dispatchEvent(new Event(authStorageEvent));
}

export function getAuthStorageEventName() {
  return authStorageEvent;
}
