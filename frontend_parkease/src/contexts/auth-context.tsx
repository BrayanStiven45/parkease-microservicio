"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthAPI, type ApiUser } from '@/lib/api';

interface UserData {
  username: string;
  parkingLotName: string;
  [key: string]: any;
}

interface AuthContextType {
  user: ApiUser | null | undefined;
  userData: UserData | null;
  loading: boolean;
  error: Error | undefined;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceReloadUserData: () => Promise<void>;
  forceReloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.email === 'admin@parkease.com';

  const fetchUserData = useCallback(async () => {
    try {
      setIsUserDataLoading(true);
      const profile = await AuthAPI.getProfile().catch(() => null);
      if (profile?.userData) {
        setUserData(profile.userData as UserData);
        console.log('estoy en fetchuserdata2', profile);
      } else if (profile?.user) {
        const { userData: ud, ...rest } = profile;
        console.log('estoy en fetchuserdata', profile);
        if (ud) setUserData(ud as UserData);
        setUser(rest);
      }
    } catch {
      // ignorar errores
    } finally {
      setIsUserDataLoading(false);
    }
  }, []);

  // 🔑 Nuevo: login centralizado
  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthAPI.signIn(email, password);
    if (res?.user) {
      setUser(res.user as ApiUser);
      await fetchUserData();
    }
  }, [fetchUserData]);

  useEffect(() => {
    // Al montar, verificar token
    (async () => {
      try {
        setLoading(true);
        const res = await AuthAPI.verifyToken().catch(() => null);
        if (res?.user) {
          const resUser = {
            email: res.user.email,
            uid: res.user.uid,
          };
          setUser(resUser as ApiUser);
        } else {
          setUser(null);
        }
      } catch (e: any) {
        setError(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔑 Solo traer perfil si hay usuario y aún no tenemos datos
  useEffect(() => {
    if (user && userData === null) {
      fetchUserData();
    } else if (!user) {
      setUserData(null);
      setIsUserDataLoading(false);
    }
  }, [user, userData, fetchUserData]);

  const forceReloadUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // 🔄 Forzar recarga del usuario (sin depender de userData). Revalida el token y actualiza user.
  const forceReloadUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AuthAPI.verifyToken().catch(() => null);
      if (res?.user) {
        const resUser = { email: res.user.email, uid: res.user.uid };
        setUser(resUser as ApiUser);
      } else {
        setUser(null);
      }
    } catch (e: any) {
      setError(e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔑 Redirecciones controladas
  useEffect(() => {
    if (!loading && !isUserDataLoading) {
      const isAuthPage = pathname === '/';
      const isSignupPage = pathname === '/signup';

      if (!user && !isAuthPage && !isSignupPage) {
        router.push('/');
      }
      if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isUserDataLoading, router, pathname]);

  const logout = useCallback(async () => {
    await AuthAPI.signOut();
    setUser(null);
    setUserData(null);
    router.push('/');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      error,
      isAdmin,
      login,
      logout,
      forceReloadUserData,
      forceReloadUser,
    }),
    [user, userData, loading, error, isAdmin, login, logout, forceReloadUserData, forceReloadUser]
  );

  const isAuthPage = pathname === '/' || pathname === '/signup';
  if ((loading || isUserDataLoading) && !isAuthPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
