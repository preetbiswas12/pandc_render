import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useUser, useAuth } from '@clerk/react';
import { config } from '../config/env';

interface AdminUser {
  email: string;
  role: string;
  permissions: string[];
  imageUrl?: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const ADMIN_EMAIL = config.admin.email;

export const isAdminEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, signOut } = useAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Clerk user state with admin context
  useEffect(() => {
    if (!isUserLoaded) return;

    if (isSignedIn && user) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress;

      if (isAdminEmail(primaryEmail)) {
        const adminData: AdminUser = {
          email: primaryEmail!,
          role: 'super_admin',
          permissions: ['products', 'orders', 'coupons', 'categories', 'banners', 'guidelines'],
          imageUrl: user.imageUrl,
        };
        setAdmin(adminData);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      } else {
        setAdmin(null);
        localStorage.removeItem('adminUser');
      }
    } else {
      setAdmin(null);
      localStorage.removeItem('adminUser');
    }

    setIsLoading(false);
  }, [isSignedIn, user, isUserLoaded]);

  const login = async (_email: string, _password: string) => {
    navigate('/admin/login');
  };

  const logout = async () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
    await signOut();
    navigate('/admin/login');
  };

  const verifyToken = async (): Promise<boolean> => {
    return !!admin && isSignedIn === true;
  };

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress;
  const adminCheck = isAdminEmail(primaryEmail);

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin && isSignedIn === true,
    isAdmin: adminCheck,
    isLoading: isLoading || !isUserLoaded,
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
