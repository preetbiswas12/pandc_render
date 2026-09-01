import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  if (!clerkPubKey) {
    console.warn('Clerk publishable key not configured. Set VITE_CLERK_PUBLISHABLE_KEY in .env');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  );
}
