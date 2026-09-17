import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vertex_token') || localStorage.getItem('vx_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('vx_user');
      if (saved) return JSON.parse(saved);
      const curToken = localStorage.getItem('vertex_token') || localStorage.getItem('vx_token');
      if (curToken) {
        const parts = curToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload && (payload.id || payload.email)) {
            return {
              id: payload.id,
              email: payload.email,
              username: payload.username || payload.email?.split('@')[0] || 'User',
              role: payload.role || 'customer',
              status: 'active'
            } as unknown as User;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('vertex_token') || localStorage.getItem('vx_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const u = res.data.user || res.data;
      if (res.data.token) {
        localStorage.setItem('vertex_token', res.data.token);
        localStorage.setItem('vx_token', res.data.token);
      }
      setUser(u);
      localStorage.setItem('vx_user', JSON.stringify(u));
    } catch (e: any) {
      if (e?.response?.status === 401) {
        localStorage.removeItem('vertex_token');
        localStorage.removeItem('vx_token');
        localStorage.removeItem('vx_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('vertex_token', newToken);
    localStorage.setItem('vx_token', newToken);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vx_user', JSON.stringify(newUser));
  };

  const logout = () => {
    localStorage.removeItem('vertex_token');
    localStorage.removeItem('vx_token');
    localStorage.removeItem('vx_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
