import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../services/database-supabase';
import bcrypt from 'bcryptjs';

interface AdminUser {
  email: string;
  role: string;
  permissions: string[];
}

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        setAdmin(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved admin user:', error);
        localStorage.removeItem('adminUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Fetch admin from Supabase
      const { data: admins, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error || !admins || admins.length === 0) {
        throw new Error('Invalid email or password');
      }

      const adminRecord = admins[0];
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, adminRecord.password);
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      const adminData: AdminUser = {
        email: adminRecord.email,
        role: adminRecord.role,
        permissions: adminRecord.permissions || ['products', 'orders', 'coupons', 'categories', 'banners', 'guidelines'],
      };
      
      setAdmin(adminData);
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      navigate('/admin');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const verifyToken = async (): Promise<boolean> => {
    // Simple token verification - check if admin session is still valid
    return !!admin;
  };

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    verifyToken,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
