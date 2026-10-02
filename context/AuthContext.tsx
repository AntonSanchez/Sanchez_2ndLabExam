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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

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
    // TODO EXAM: Delete the saved token using SecureStore.deleteItemAsync().
    // TODO EXAM: Clear token state and user state.
    // TODO EXAM: Handle storage errors and redirect to /sign-in after logout.
  }, []);

  const restoreSession = useCallback(async () => {
    // TODO EXAM: Set authLoading while restoring the session.
    // TODO EXAM: Read the saved token with SecureStore.getItemAsync().
    // TODO EXAM: Validate the token via GET /profile with a Bearer token.
    // TODO EXAM: Update token and user state for a valid session.
    // TODO EXAM: Handle 401 Unauthorized / expired sessions and clear invalid credentials.
    // TODO EXAM: Handle errors and stop authLoading in finally.
  }, []);

  useEffect(() => {
    // TODO EXAM: Call restoreSession() on startup.
  }, [restoreSession]);

  const value = useMemo(
    () => ({ token, user, authLoading, login, logout, restoreSession }),
    [token, user, authLoading, login, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
