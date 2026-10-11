import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserResponse } from '../types/auth';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: UserResponse, token: string, expiresAt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadPersistedAuth(): AuthState {
  try {
    const token = localStorage.getItem('frenzo_token');
    const userJson = localStorage.getItem('frenzo_user');
    const expiresAt = localStorage.getItem('frenzo_expires');

    if (token && userJson && expiresAt) {
      const expiry = new Date(expiresAt).getTime();
      if (Date.now() < expiry) {
        return { user: JSON.parse(userJson), token, isAuthenticated: true };
      }
      // Token expired — clean up
      localStorage.removeItem('frenzo_token');
      localStorage.removeItem('frenzo_user');
      localStorage.removeItem('frenzo_expires');
    }
  } catch {
    // Corrupted storage — ignore
  }
  return { user: null, token: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(loadPersistedAuth);

  const login = useCallback((user: UserResponse, token: string, expiresAt: string) => {
    localStorage.setItem('frenzo_token', token);
    localStorage.setItem('frenzo_user', JSON.stringify(user));
    localStorage.setItem('frenzo_expires', expiresAt);
    setAuthState({ user, token, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('frenzo_token');
    localStorage.removeItem('frenzo_user');
    localStorage.removeItem('frenzo_expires');
    setAuthState({ user: null, token: null, isAuthenticated: false });
  }, []);

  // Auto-logout when token expires
  useEffect(() => {
    const expiresAt = localStorage.getItem('frenzo_expires');
    if (!expiresAt) return;

    const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(logout, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [authState.token, logout]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
