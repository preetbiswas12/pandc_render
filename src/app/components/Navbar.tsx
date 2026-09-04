import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { gsap } from 'gsap';
import { Menu, X, Heart, User, ShoppingCart, LogOut, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, useAuth, useSession, UserButton } from '@clerk/react';
import { isAdminEmail } from '../context/AdminContext';

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount: cartCountProp }: NavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, wishlist, categories } = useApp();
  const { isSignedIn, user, isLoaded } = useUser();
  const { session } = useSession();
  const { signOut } = useAuth();

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress;
  const isAdmin = isAdminEmail(primaryEmail);

  // Sync Clerk user data to localStorage whenever auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';
      const userName = user.firstName || user.username || email.split('@')[0] || '';
      const userPfp = user.imageUrl;

      localStorage.setItem('userId', `user_${email.toLowerCase()}`);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', email);
      if (userPfp) localStorage.setItem('userPfp', userPfp);
    } else if (isLoaded && !isSignedIn) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPfp');
    }
  }, [isSignedIn, user, isLoaded, session]);

  // Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPfp');
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/sign-in');
  };

  const userName = user?.firstName || user?.username || (primaryEmail ? primaryEmail.split('@')[0] : '');
  const isLoggedIn = isSignedIn && !!user;

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-[#030213]">P&C TEXFAB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#030213] transition-colors">
              Home
            </Link>
            <Link to="/deals" className="text-sm font-medium text-[#0057c2] hover:text-[#0047a0] transition-colors font-semibold">
              Hot Deals
            </Link>
            <Link to="/shop" className="text-sm font-medium text-gray-600 hover:text-[#030213] transition-colors">
              Shop
            </Link>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-[#030213] transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-[#030213] transition-colors">
              Contact
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-[#d946ef] hover:text-[#c026d3] transition-colors font-semibold">
                Admin
              </Link>
            )}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-[#030213] transition-colors">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#030213] transition-colors">
              <ShoppingCart size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#030213] text-white text-xs rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/orders"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-[#030213] transition-colors"
                >
                  <Package size={18} />
                  <span>Orders</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                      },
                    }}
                  />
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="hidden md:flex items-center space-x-1 px-4 py-2 bg-[#030213] text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-sm font-medium text-gray-600 hover:text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/deals" className="block text-sm font-medium text-[#0057c2] hover:text-[#0047a0]" onClick={() => setIsMenuOpen(false)}>
                Hot Deals
              </Link>
              <Link to="/shop" className="block text-sm font-medium text-gray-600 hover:text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link to="/about" className="block text-sm font-medium text-gray-600 hover:text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="block text-sm font-medium text-gray-600 hover:text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block text-sm font-medium text-[#d946ef] hover:text-[#c026d3] font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
              {isLoggedIn ? (
                <>
                  <Link to="/orders" className="block text-sm font-medium text-gray-600 hover:text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                    My Orders
                  </Link>
                  <div className="flex items-center space-x-2 py-2">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-sm font-medium text-gray-700">{userName || primaryEmail}</span>
                  </div>
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="block text-sm font-medium text-red-500">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/sign-in" className="block text-sm font-medium text-[#030213]" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
