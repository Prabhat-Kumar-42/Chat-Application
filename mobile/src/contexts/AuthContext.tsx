import { createContext, useState, useEffect, ReactNode } from "react";
import { saveToken, getToken, clearToken } from "../utils/storage.util";
import { login as apiLogin, register as apiRegister } from "../api/auth.api";
import { useStore } from "../store/index";
import { setAuthHeader } from "../utils/auth-header.util";

type AuthContextType = {
  token?: string | null;
  setToken: (t?: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({ setToken: async () => {}, logout: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const setMe = useStore.getState().setMe;

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        setAuthHeader(t);
        setTokenState(t);
        // optionally fetch profile endpoint to set `me`
      }
    })();
  }, []);

  const setToken = async (t?: string | null) => {
    if (t) {
      await saveToken(t);
      setAuthHeader(t);
      setTokenState(t);
    } else {
      await clearToken();
      setAuthHeader(undefined);
      setTokenState(null);
      setMe(undefined);
    }
  };

  const logout = async () => setToken(null);

  return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>;
};
