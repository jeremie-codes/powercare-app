import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { setAuthToken, AuthApi } from '../services/api';
import { User, AnyProfile, UserCreate, UserUpdate } from 'types';

export type AuthUser = User | null;
export type AuthProfile = AnyProfile | null;

export interface AuthContextValue {
  user: AuthUser;
  profile: AuthProfile;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string;}>;
  register: (datas: UserCreate) => Promise<{ success: boolean; message: string;}>;
  updateAccount: (datas: UserUpdate) => Promise<{ success: boolean; message: string;}>;
  updateImage: (datas: FormData) => Promise<{ success: boolean; message: string;}>;
  signOut: () => Promise<{ success: boolean; message: string;}>;
  setSession: (token: string | null, user: AuthUser, profile: AuthProfile) => void;
  accountDelete: () => Promise<{ success: boolean; message: string;}>;
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
      const { success, message, data } = await AuthApi.login(email, password);

      if (!success) {
        return { success: false, message };
      }
      setSession(data.token, data.user, data.profile);
      return { success, message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const register = useCallback(async (datas: UserCreate) => {
    setLoading(true);
    try {
      const { success, message, data } = await AuthApi.register(datas);

      if (!success) {
        return { success: false, message };
      }
      console.log(data)
      setSession(data.token, data.user, data.profile);
      return { success, message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const updateAccount = useCallback(async (datas: UserUpdate) => {
    setLoading(true);
    try {
      const { success, message, data } = await AuthApi.updateAccount(datas);

      if (!success) {
        return { success: false, message };
      }

      setUser(data.user);
      setProfile(data.profile);

      return { success, message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const updateImage = useCallback(async (datas: FormData) => {
    setLoading(true);
    try {
      const { success, message, data } = await AuthApi.updateImage(datas);

      if (!success) {
        return { success: false, message };
      }

      setUser(data.user);

      return { success, message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { success, message } = await AuthApi.logout();

      if (!success) {
        return { success: false, message };
      }

      setSession(null, null, null);
      return { success, message };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const accountDelete = useCallback(async () => {
    setLoading(true);
    try {
      const { success, message } = await AuthApi.deleteAccount();

      if (!success) {
        return { success: false, message };
      }
      setSession(null, null, null);
      return { success, message };

    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const value = useMemo<AuthContextValue>(() => ({ user, profile, token, loading, signIn, register, signOut, setSession, accountDelete, updateAccount, updateImage }), 
                                                  [user, profile, token, loading, signIn, register, signOut, setSession, accountDelete, updateAccount, updateImage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
