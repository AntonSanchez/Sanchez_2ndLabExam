/* eslint-disable @typescript-eslint/no-unused-vars -- Setters and imports are reserved for exam TODOs. */
import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

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
  // Starts true: the app waits for session restoration before choosing a screen.
  const [authLoading, setAuthLoading] = useState(true);

  const login = async (accessToken: string, userData: User) => {
    // TODO EXAM: Save the access token with SecureStore.setItemAsync().
    // TODO EXAM: Update token state and user state with the supplied arguments.
    // TODO EXAM: Handle storage failures; never store the password.
  };

  const logout = async () => {
    // TODO EXAM: Delete the saved token using SecureStore.deleteItemAsync().
    // TODO EXAM: Clear token state and user state.
    // TODO EXAM: Handle storage errors and redirect to /sign-in after logout.
  };

  const restoreSession = async () => {
    // TODO EXAM: Set authLoading while restoring the session.
    // TODO EXAM: Read the saved token with SecureStore.getItemAsync().
    // TODO EXAM: Validate the token via GET /profile with a Bearer token.
    // TODO EXAM: Update token and user state for a valid session.
    // TODO EXAM: Handle 401 Unauthorized / expired sessions and clear invalid credentials.
    // TODO EXAM: Handle errors and stop authLoading in finally.
  };

  useEffect(() => {
    // TODO EXAM: Call restoreSession() on startup.
  }, []);

  // SecureStore is native-only. The web skeleton makes no storage calls.
  // TODO EXAM: Check platform availability before storage calls; test persistence on Android/iOS.
  return (
    <AuthContext.Provider value={{ token, user, authLoading, login, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}
