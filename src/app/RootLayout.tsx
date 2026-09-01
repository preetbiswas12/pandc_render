import { Outlet } from 'react-router';
import { AdminProvider } from './context/AdminContext';
import { AppProvider } from './context/AppContext';
import { ClerkProviderWrapper } from './context/ClerkProvider';
import ScrollToTop from './components/ScrollToTop';

export default function RootLayout() {
  return (
    <ClerkProviderWrapper>
      <AdminProvider>
        <AppProvider>
          <>
            <ScrollToTop />
            <Outlet />
          </>
        </AppProvider>
      </AdminProvider>
    </ClerkProviderWrapper>
  );
}
