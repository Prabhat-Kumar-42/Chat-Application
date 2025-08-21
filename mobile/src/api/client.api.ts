import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = (Constants.expoConfig?.extra as any)?.API_URL || process.env.API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL: API_URL });
// attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth-token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
