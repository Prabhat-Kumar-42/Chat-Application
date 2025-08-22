import { createContext, useState, useEffect, ReactNode } from 'react';
import { saveToken, getToken, clearToken } from '../utils/storage.util';
import { setAuthHeader } from '../utils/auth-header.util';
import { useUserStore } from '~/stores/user.store';
import socketSingletonService from '~/services/socket-singleton.service';
import { parseJwt } from '~/utils/parse-jwt.util';

type AuthContextType = {
  token?: string | null;
  setToken: (t?: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  setToken: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const setMe = useUserStore.getState().setMe;

  // Load token on mount
  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t && t !== token) {
        setAuthHeader(t);
        setTokenState(t);
      }
    })();
  }, []); 

  useEffect(() => {
    if (!token) return;

    const payload = parseJwt(token);
    if (payload && payload.id) {
      // ensure we set fields expected by your User type
      setMe({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        lastSeenAt: payload.lastSeenAt ?? null,
        // createdAt is optional depending on your DTO shape; set only if present or omit
      });
    } else {
      console.warn('AuthProvider: token parsed but no payload.id found', payload);
    }
  }, [token]);

  // Set token (login)
  const setToken = async (t?: string | null) => {
    if (t) {
      await saveToken(t);
      setAuthHeader(t);
      setTokenState(t);
      // Initialize socket after login
      socketSingletonService.init(t);
    } else {
      await clearToken();
      setAuthHeader(undefined);
      setTokenState(null);
      setMe(undefined);
      // Disconnect socket on logout
      socketSingletonService.disconnect();
    }
  };

  const logout = async () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>
  );
};
