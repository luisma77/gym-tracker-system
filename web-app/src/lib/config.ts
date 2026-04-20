const fallbackApiUrl = "http://localhost:8000";

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Gym Tracker",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl
};
