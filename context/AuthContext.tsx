/* eslint-disable @typescript-eslint/no-unused-vars -- Setters and imports are reserved for later exam TODOs. */
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // False keeps the app usable until session restoration is implemented.
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (accessToken: string, userData: User) => {
    // TODO EXAM: Save the access token with SecureStore.setItemAsync().
    setToken(accessToken);
    setUser(userData);
    // TODO EXAM: Handle storage failures; never store the password.
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

  // SecureStore is native-only. The web skeleton makes no storage calls.
  // TODO EXAM: Check platform availability before storage calls; test persistence on Android/iOS.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
