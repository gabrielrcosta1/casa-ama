import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/hooks/use-admin-auth';
import AdminLogin from './admin-login';
import AdminDashboard from './admin-dashboard';

function AdminContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && showLogin) {
    return (
      <AdminLogin 
        onLoginSuccess={() => setShowLogin(false)} 
      />
    );
  }

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <AdminLogin 
      onLoginSuccess={() => setShowLogin(false)} 
    />
  );
}

export default function Admin() {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
}