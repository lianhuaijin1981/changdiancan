import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { SuperAdminUser } from '../types';

interface AdminContextType {
  user: SuperAdminUser | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('superadmin_token');
    if (token) {
      apiClient.setToken(token);
      try {
        const { user } = await apiClient.me();
        if (user.role === 'superadmin') {
          setUser(user);
        } else {
          localStorage.removeItem('superadmin_token');
          apiClient.setToken(null);
        }
      } catch {
        localStorage.removeItem('superadmin_token');
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
    if (user.role !== 'superadmin') {
      throw new Error('无权访问，仅超级管理员可登录');
    }
    localStorage.setItem('superadmin_token', token);
    apiClient.setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('superadmin_token');
    apiClient.setToken(null);
    setUser(null);
    window.location.hash = '#/login';
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
