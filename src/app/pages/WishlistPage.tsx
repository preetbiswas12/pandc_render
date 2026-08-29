import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { NoiseButton } from '@/components/ui/noise-button';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, products } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.wishlist-item', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#f7f9fb]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #141b2b 0%, #1a2744 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,87,194,0.5) 0%, rgba(0,87,194,0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={28} style={{ color: '#ef4444' }} />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              My Wishlist
            </h1>
          </div>
          <p className="text-[#a0a4b0] text-base md:text-lg">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-8 md:py-12">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(0,87,194,0.08)' }}
            >
              <Heart size={36} style={{ color: '#0057c2', opacity: 0.4 }} />
            </div>
            <h2 className="text-2xl font-bold text-[#191c1e] mb-3">Your wishlist is empty</h2>
            <p className="text-[#76777d] mb-8 max-w-sm mx-auto">
              Save your favorite items for later
            </p>
            <NoiseButton onClick={() => navigate('/shop')} containerClassName="w-fit">
              Start Shopping
            </NoiseButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="wishlist-item group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className="aspect-square bg-[#f7f9fb] cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={convertGoogleDriveLink(product.images?.[0] || '')}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"%3E%3Crect fill="%23e5e7eb" width="300" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-size="16"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {product.offerPercentage > 0 && (
                    <span
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      -{product.offerPercentage}%
                    </span>
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-sm md:text-base font-semibold text-[#191c1e] mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#76777d] mb-3">{product.fabricType}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-base md:text-lg font-bold text-[#191c1e]">
                      ₹{(product.price - (product.price * product.offerPercentage / 100)).toFixed(2)}
                    </span>
                    {product.offerPercentage > 0 && (
                      <>
                        <span className="text-xs text-[#76777d] line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (addedProducts.has(product._id)) {
                          navigate('/cart');
                        } else {
                          addToCart(product);
                          setAddedProducts(prev => new Set([...prev, product._id]));
                          setTimeout(() => {
                            setAddedProducts(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(product._id);
                              return newSet;
                            });
                          }, 3000);
                        }
                      }}
                      className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 text-white hover:opacity-90"
                      style={{ backgroundColor: addedProducts.has(product._id) ? '#16a34a' : '#0057c2' }}
                    >
                      <ShoppingCart size={16} />
                      {addedProducts.has(product._id) ? 'View Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all hover:bg-red-50 text-red-500"
                      style={{
                        borderColor: '#ef4444',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
