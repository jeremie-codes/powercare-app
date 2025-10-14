import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { setAuthToken, AuthApi } from '../services/api';
import { User, AnyProfile } from 'types';

export type AuthUser = User | null;
export type AuthProfile = AnyProfile | null;

export interface AuthContextValue {
  user: AuthUser;
  profile: AuthProfile;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void> | void;
  setSession: (token: string | null, user: AuthUser, profile: AuthProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<AuthProfile>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setSession = useCallback((newToken: string | null, newUser: AuthUser, newProfile: AuthProfile) => {
    setToken(newToken);
    setProfile(newProfile);
    setUser(newUser);
    setAuthToken(newToken);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const resp = await AuthApi.login(email, password);
      setSession(resp.token, resp.user, resp.profile);
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    // TODO: Optionally call an API endpoint to invalidate the token
    setSession(null, null, null);
  }, [setSession]);

  const value = useMemo<AuthContextValue>(() => ({ user, profile, token, loading, signIn, signOut, setSession }), [user, profile, token, loading, signIn, signOut, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
