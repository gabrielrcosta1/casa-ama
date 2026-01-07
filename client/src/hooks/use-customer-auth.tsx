import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Customer, InsertCustomer, CustomerLogin } from '@shared/schema';

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: CustomerLogin) => Promise<Customer>;
  register: (data: InsertCustomer) => Promise<Customer>;
  logout: () => void;
  updateProfile: (data: Partial<InsertCustomer>) => Promise<Customer>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  // Check if customer data exists in localStorage on load
  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        setCustomer(JSON.parse(storedCustomer));
      } catch (error) {
        localStorage.removeItem('customer');
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: CustomerLogin) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      setCustomer(customerData);
      localStorage.setItem('customer', JSON.stringify(customerData));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      setCustomer(customerData);
      localStorage.setItem('customer', JSON.stringify(customerData));
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertCustomer>) => {
      if (!customer) throw new Error('No customer logged in');
      const response = await apiRequest('PUT', `/api/auth/customer/${customer.id}`, data);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      setCustomer(customerData);
      localStorage.setItem('customer', JSON.stringify(customerData));
    },
  });

  const login = async (credentials: CustomerLogin): Promise<Customer> => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = async (data: InsertCustomer): Promise<Customer> => {
    return registerMutation.mutateAsync(data);
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer');
    queryClient.clear();
  };

  const updateProfile = async (data: Partial<InsertCustomer>): Promise<Customer> => {
    return updateProfileMutation.mutateAsync(data);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}