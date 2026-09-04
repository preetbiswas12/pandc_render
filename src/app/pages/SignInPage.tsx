import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { SignIn, useUser } from '@clerk/clerk-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress;
      const userName = user.firstName || primaryEmail?.split('@')[0] || '';
      const userPfp = user.imageUrl;

      localStorage.setItem('userId', `user_${primaryEmail?.toLowerCase()}`);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', primaryEmail || '');
      if (userPfp) localStorage.setItem('userPfp', userPfp);

      navigate('/', { replace: true });
    }
  }, [isSignedIn, user, isLoaded, navigate]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-[#0057c2]" style={{ fontFamily: 'Inter, sans-serif' }}>
            P&C TEXFAB
          </Link>
          <h1 className="text-2xl font-bold text-[#191c1e] mt-4 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
            appearance={{
              elements: {
                card: 'shadow-lg rounded-xl',
              },
            }}
          />
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#76777d] hover:text-[#0057c2] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
