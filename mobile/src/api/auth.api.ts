import api from "./client.api";

export const register = (name: string, email: string, password: string) =>
  api.post("/auth/register", { name, email, password });

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });
