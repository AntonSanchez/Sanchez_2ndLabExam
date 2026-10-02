import { authHeaders, normalizePerson, pickNested, profileUrl, readJson } from '@/constants/apiHelpers';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  authLoading: boolean;
  login: (accessToken: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'access_token';

async function isStorageAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = useCallback(async (accessToken: string, userData: User) => {
    if (await isStorageAvailable()) {
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      } catch {
        throw new Error('Could not securely save your session on this device.');
      }
    }
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (await isStorageAvailable()) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Could not delete the saved token:', e);
    } finally {
      setToken(null);
      setUser(null);
      router.replace('/sign-in');
    }
  }, [router]);

  const restoreSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      if (!(await isStorageAvailable())) return;

      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!savedToken) return;

      const response = await fetch(profileUrl(savedToken), { headers: authHeaders(savedToken) });

      if (response.status === 401 || response.status === 403) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return;
      }
      if (!response.ok) {
        throw new Error(`Profile check failed (${response.status}).`);
      }

      const json = await readJson(response);
      const profile = normalizePerson(pickNested<unknown>(json, ['user', 'profile', 'data']) ?? json);
      setToken(savedToken);
      setUser(profile);
    } catch (e) {
      console.warn('Could not restore the session:', e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({ token, user, authLoading, login, logout, restoreSession }),
    [token, user, authLoading, login, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
