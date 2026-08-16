import { RouterProvider } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { router } from "./routes";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

export default function App() {
  const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5173/' 
    : 'https://pandctexfab.com/';
  
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInFallbackRedirectUrl={redirectUrl}
      signUpFallbackRedirectUrl={redirectUrl}
      afterSignOutUrl={redirectUrl}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  );
}