'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth-service';
import { userService } from '@/lib/services/user-service';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    username: string;
    parkingLotName: string;
    maxCapacity: number;
    hourlyCost: number;
    address: string;
    city: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Validar token y obtener datos del usuario
          const isValid = await authService.validateToken();
          if (isValid) {
            const profile = await userService.getProfile();
            setUser(profile);
          } else {
            // Token inválido, limpiar
            await authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    username: string;
    parkingLotName: string;
    maxCapacity: number;
    hourlyCost: number;
    address: string;
    city: string;
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar el estado local
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (!authService.isAuthenticated()) return;
      
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Si falla la actualización, hacer logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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