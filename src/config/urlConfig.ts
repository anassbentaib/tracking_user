export const serverUrl =
  import.meta.env.VITE_APP_ENV === "development"
    ? import.meta.env.VITE_BACKEND_URL
    : import.meta.env.VITE_SERVER_URL;
