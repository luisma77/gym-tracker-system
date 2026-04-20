const authTokenKey = "gym-tracker-token";
const authUserKey = "gym-tracker-user";

export function saveAuthSession(token: string, user: unknown) {
  window.localStorage.setItem(authTokenKey, token);
  window.localStorage.setItem(authUserKey, JSON.stringify(user));
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
}
