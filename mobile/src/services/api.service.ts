import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL =
  (Constants.expoConfig?.extra as any)?.API_URL ||
  process.env.API_URL ||
  "http://localhost:4000";

export const api = axios.create({ baseURL: API_URL });

// keep this for convenience; requests that happen before setAuthHeader will still work
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("auth-token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
