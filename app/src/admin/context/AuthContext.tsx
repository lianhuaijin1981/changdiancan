import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      apiClient.setToken(token);
      try {
        const { user } = await apiClient.me();
        setUser(user);
      } catch {
        localStorage.removeItem('admin_token');
        apiClient.setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (phone: string, password: string) => {
    const { token, user } = await apiClient.login(phone, password);
    localStorage.setItem('admin_token', token);
    apiClient.setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    apiClient.setToken(null);
    setUser(null);
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
