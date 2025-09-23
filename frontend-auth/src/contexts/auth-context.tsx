// Auth Context - Contexto de autenticación usando servicios API
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../lib/services/auth-service';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@parkease.com';

  // Cargar usuario desde localStorage al iniciar
  const loadUserFromStorage = useCallback(() => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();

      if (currentUser && token) {
        setUser(currentUser);
        // Verificar si el token sigue siendo válido
        authService.validateToken().then((isValid) => {
          if (!isValid) {
            // Token inválido, hacer logout
            handleLogout();
          }
        });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setError('Error loading user session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de login
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      setUser(response.user);
      
      // Redirigir después del login exitoso
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de signup
  const handleSignup = async (userData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.signup(userData);
      setUser(response.user);
      
      // Redirigir después del signup exitoso
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Aún así, limpiar el estado local
      setUser(null);
      setError(null);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = async (): Promise<void> => {
    try {
      const updatedUser = await authService.refreshUserData();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError('Error refreshing user data');
    }
  };

  // Efecto para cargar usuario al montar el componente
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Efecto para manejar cambios de ruta y verificar autenticación
  useEffect(() => {
    const publicRoutes = ['/login', '/signup'];
    const currentPath = location.pathname;
    
    if (!loading) {
      // Si no hay usuario y no estamos en una ruta pública
      if (!user && !publicRoutes.includes(currentPath)) {
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
      }
      
      // Si hay usuario y está en login/signup, redirigir al dashboard
      if (user && publicRoutes.includes(currentPath)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, location, navigate]);

  // Auto-refresh del token cada 30 minutos
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const isValid = await authService.validateToken();
        if (!isValid) {
          handleLogout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        handleLogout();
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Manejar errores de autenticación global
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail.status === 401) {
        setError('Session expired. Please login again.');
        handleLogout();
      }
    };

    window.addEventListener('authError' as any, handleAuthError);
    return () => window.removeEventListener('authError' as any, handleAuthError);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAdmin,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Hook personalizado para verificar si el usuario está autenticado
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', {
        state: { from: location },
        replace: true,
      });
    }
  }, [user, loading, navigate, location]);

  return { user, loading };
}

// Hook para verificar permisos de admin
export function useRequireAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  return { user, loading, isAdmin };
}