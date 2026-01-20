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

// Helper function to parse address JSON if it's a valid JSON string
function parseCustomerAddress(customer: Customer): Customer {
  if (customer.address && typeof customer.address === 'string') {
    try {
      const parsed = JSON.parse(customer.address);
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...customer, address: parsed as any };
      }
    } catch {
      // If parsing fails, keep the original string
    }
  }
  return customer;
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if customer data exists in localStorage on load
  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      try {
        const parsedCustomer = JSON.parse(storedCustomer);
        const customerWithParsedAddress = parseCustomerAddress(parsedCustomer);
        setCustomer(customerWithParsedAddress);
      } catch (error) {
        localStorage.removeItem('customer');
      }
    }
    setIsInitialLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: CustomerLogin) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      const customerWithParsedAddress = parseCustomerAddress(customerData);
      setCustomer(customerWithParsedAddress);
      localStorage.setItem('customer', JSON.stringify(customerWithParsedAddress));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      const customerWithParsedAddress = parseCustomerAddress(customerData);
      setCustomer(customerWithParsedAddress);
      localStorage.setItem('customer', JSON.stringify(customerWithParsedAddress));
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertCustomer>) => {
      if (!customer) throw new Error('No customer logged in');
      const response = await apiRequest('PUT', `/api/auth/customer/${customer.id}`, data);
      return response.json();
    },
    onSuccess: (customerData: Customer) => {
      const customerWithParsedAddress = parseCustomerAddress(customerData);
      setCustomer(customerWithParsedAddress);
      localStorage.setItem('customer', JSON.stringify(customerWithParsedAddress));
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
        isLoading: isInitialLoading || loginMutation.isPending || registerMutation.isPending || updateProfileMutation.isPending,
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
