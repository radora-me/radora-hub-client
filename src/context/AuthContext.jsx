import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('radora_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('radora_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify stored token with backend
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('radora_auth_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('radora_auth_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session invalid or expired:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen to unauthorized event from API interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('radora:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('radora:unauthorized', handleUnauthorized);
  }, []);

  const login = async (identifier, password) => {
    const res = await authApi.login(identifier, password);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('radora_auth_token', newToken);
      localStorage.setItem('radora_auth_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('radora_auth_token');
    localStorage.removeItem('radora_auth_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('radora_auth_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('[AuthContext] Error refreshing user:', err);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'architect_admin',
    isTeamMember: user?.role === 'team_member',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
