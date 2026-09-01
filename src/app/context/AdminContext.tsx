import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useUser, useAuth } from '@clerk/clerk-react';
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_EMAIL = config.admin.email;

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

      // Only allow admin access for the configured admin email
      if (primaryEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        const adminData: AdminUser = {
          email: primaryEmail,
          role: 'super_admin',
          permissions: ['products', 'orders', 'coupons', 'categories', 'banners', 'guidelines'],
          imageUrl: user.imageUrl,
        };
        setAdmin(adminData);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      } else {
        // Not an admin email - sign out and clear
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
    // Login is now handled by Clerk's SignIn component
    // This method is kept for compatibility but redirects to Clerk login
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

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin && isSignedIn === true,
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
