import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Custom fetch function for admin requests
async function adminFetch(url: string, options: RequestInit = {}) {
  const sessionId = localStorage.getItem('admin-session-id');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId && { 'x-admin-session-id': sessionId }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  return response;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // Check if admin is authenticated
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/admin/auth'],
    queryFn: async () => {
      try {
        const response = await adminFetch('/api/admin/auth');
        return response.json();
      } catch (error) {
        return { authenticated: false };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setIsAuthenticated(!!authData?.authenticated);
  }, [authData]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await adminFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (data.sessionId) {
        localStorage.setItem('admin-session-id', data.sessionId);
      }
      
      return data;
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auth'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await adminFetch('/api/admin/logout', { method: 'POST' });
      localStorage.removeItem('admin-session-id');
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const checkAuth = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/auth'] });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}