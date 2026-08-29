import { Outlet } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ShoppingCart } from './components/ShoppingCart';
import { useApp } from './context/AppContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const { cartItems, wishlist, updateQuantity, removeFromCart } = useApp();
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  useEffect(() => {
    // Page load animation
    const ctx = gsap.context(() => {
      gsap.from(appRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, appRef);

    // Refresh ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-white flex flex-col">
      <div className="w-full flex-1">
        <Navbar cartCount={totalCartItems} wishlistCount={wishlist.length} />

        <main>
          <Outlet />
        </main>
      </div>

      <Footer />
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}


