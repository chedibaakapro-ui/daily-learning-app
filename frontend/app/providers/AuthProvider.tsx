'use client';

import AuthApi from '@/modules/auth/core/AuthApi';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string } | null;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    const token = AuthApi.getToken();
    if (token) {
      // In a production app, you'd validate the token with the backend
      // For now, we'll just check if it exists
      try {
        // Decode JWT to get user info (basic client-side check)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          logout();
          return;
        }
        
        setUser({ id: payload.userId, email: payload.email });
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    AuthApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout, checkAuth }}>
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