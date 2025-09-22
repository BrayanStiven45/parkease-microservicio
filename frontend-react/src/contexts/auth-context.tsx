
import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
    username: string;
    parkingLotName: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null | undefined;
    userData: UserData | null;
    loading: boolean;
    error: Error | undefined;
    isAdmin: boolean;
    logout: () => Promise<void>;
    forceReloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, loading, error] = useAuthState(auth);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isUserDataLoading, setIsUserDataLoading] = useState(true);
    const router = useNavigate();
    const location = useLocation();
    
    const isAdmin = user?.email === 'admin@parkease.com';

    const fetchUserData = useCallback(async (user: User | null) => {
        if (user) {
            setIsUserDataLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
            }
            setIsUserDataLoading(false);
        } else {
            setUserData(null);
            setIsUserDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData(user);
    }, [user, fetchUserData]);

    const forceReloadUserData = useCallback(async () => {
        if (auth.currentUser) {
            await fetchUserData(auth.currentUser);
        }
    }, [fetchUserData]);

    useEffect(() => {
        if (!loading && !isUserDataLoading) {
            const isAuthPage = location.pathname === '/';
            const isSignupPage = location.pathname === '/signup';
            
            if (!user && !isAuthPage && !isSignupPage) {
                router('/');
            }
            if (user && isAuthPage) {
                router('/dashboard');
            }
        }
    }, [user, loading, isUserDataLoading, router, location.pathname]);

    const logout = async () => {
        await signOut(auth);
        setUserData(null);
        router('/');
    };
    
    const value = { user, userData, loading, error, isAdmin, logout, forceReloadUserData };

    const isAuthPage = location.pathname === '/' || location.pathname === '/signup';
    if ((loading || isUserDataLoading) && !isAuthPage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
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
