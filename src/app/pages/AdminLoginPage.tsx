import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { SignIn } from '@clerk/clerk-react';
import { useAdmin } from '../context/AdminContext';
import { gsap } from 'gsap';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAdmin();
  const pageRef = useRef<HTMLDivElement>(null);
  const hasRedirected = useRef(false);

  // Animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.login-container', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Check if already logged in — guard against double-navigate on mobile
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-magenta-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-magenta-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="login-container relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-700/50 px-8 py-12 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-magenta-500 to-pink-600 mb-4 shadow-lg shadow-magenta-500/50">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Secure authentication with Clerk</p>
          </div>

          {/* Clerk SignIn Component */}
          <div className="clerk-signin-container">
            <SignIn
              routing="virtual"
              signUpUrl={undefined}
              redirectUrl="/admin"
              appearance={{
                elements: {
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                },
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-xs">
              🔐 Secure Admin Area - Unauthorized access is prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
