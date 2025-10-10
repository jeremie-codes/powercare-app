import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { setAuthToken, AuthApi, type AuthResponse } from '../services/api';

export type AuthUser = AuthResponse['user'] | null;

export interface AuthContextValue {
  user: AuthUser;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void> | void;
  setSession: (token: string | null, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setSession = useCallback((newToken: string | null, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await AuthApi.login(email, password);
      setSession(resp.token, resp.user);
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    // TODO: Optionally call an API endpoint to invalidate the token
    setSession(null, null);
  }, [setSession]);

  const value = useMemo<AuthContextValue>(() => ({ user, token, loading, signIn, signOut, setSession }), [user, token, loading, signIn, signOut, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
