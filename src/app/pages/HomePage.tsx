import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { ProductCard } from '../components/ProductCard';

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1L12.39 6.36L18.18 7.18L13.82 11.18L15.18 17L10 14.27L4.82 17L6.18 11.18L1.82 7.18L7.61 6.36L10 1Z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FabricFabricIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 16H44" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8V16" stroke="currentColor" strokeWidth="2" />
      <path d="M32 8V16" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function HomePage() {
  const { products, categories, banners, addToCart, wishlist, toggleWishlist } = useApp();
  const collectionBanners = banners.filter(b => (b.type === 'hero-side' || b.type === 'casual-inspiration') && b.isActive).sort((a, b) => a.order - b.order);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState({ hours: 8, minutes: 42, seconds: 15 });

  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
      setLoading(false);
    }
  }, [products, categories]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          return { hours: 8, minutes: 42, seconds: 15 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const heroBanner = banners.find(b => b.type === 'hero-main' && b.isActive);
  const featuredProducts = products.slice(0, 8);
  const curatedProducts = products.slice(0, 8);
  const allCategories = categories.filter(c => c.isActive);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 400;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const categoryPills = ['Cotton', 'Silk', 'Linen', 'Viscose', 'Wool', 'Print', 'Embroidered'];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Fashion Designer',
      quote: 'The fabric quality is exceptional. I have been ordering from FabricStore for my boutique collections and the consistency is unmatched.',
      avatar: '',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Textile Merchant',
      quote: 'Best prices for premium fabrics in the market. Their dyeable collection is the finest I have worked with in 15 years.',
      avatar: '',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0057c2] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#45464c] font-medium">Loading fabrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ============ HERO SECTION ============ */}
      <section className="relative bg-[#141b2b] overflow-hidden">
        {/* Blue glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,87,194,0.4) 0%, rgba(0,87,194,0) 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left side - Text content */}
            <div className="flex-1 max-w-xl">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[rgba(0,87,194,0.15)] text-[#4d9aff] mb-6">
                Next-Gen Fabrics
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                Premium Fabric{' '}
                <span className="bg-gradient-to-r from-[#4d9aff] to-[#7b61ff] bg-clip-text text-transparent">
                  Supplier
                </span>
              </h1>
              <p className="text-base md:text-lg text-[#a0a4b0] leading-relaxed mb-8 max-w-lg">
                Discover India's finest collection of premium fabrics. From handwoven silks to contemporary prints, we supply the materials that bring your creative vision to life.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#0057c2] to-[#4d6dff] hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                >
                  Shop Now
                  <ArrowRightIcon />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm border border-[rgba(255,255,255,0.2)] hover:bg-white/5 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* Right side - Hero image */}
            <div className="flex-1 relative max-w-lg lg:max-w-xl">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                {heroBanner?.image ? (
                  <img
                    src={convertGoogleDriveLink(heroBanner.image)}
                    alt={heroBanner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a2540] to-[#0d1525] flex items-center justify-center">
                    <div className="text-center">
                      <FabricFabricIcon />
                      <p className="text-[#a0a4b0] mt-4 text-lg font-medium">Premium Fabric Collections</p>
                      <p className="text-[#76777d] text-sm mt-1">Trusted by 10,000+ designers</p>
                    </div>
                  </div>
                )}
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
              </div>
              {/* Floating stats */}
               <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 md:px-5 md:py-3 shadow-xl">
                 <p className="text-lg md:text-2xl font-bold text-white">500+</p>
                 <p className="text-[10px] md:text-xs text-[#a0a4b0]">Fabric Types</p>
               </div>
               <div className="absolute -top-2 -right-3 md:-top-2 md:-right-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 md:px-5 md:py-3 shadow-xl">
                 <p className="text-lg md:text-2xl font-bold text-white">4.9</p>
                 <p className="text-[10px] md:text-xs text-[#a0a4b0]">Customer Rating</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FLASH SALE / OFFERS SECTION ============ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #141b2b 0%, #1a2744 100%)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left - Offer info */}
            <div className="flex-1 max-w-lg">
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                style={{ background: 'linear-gradient(135deg, #ff6b00, #ff007a)' }}
              >
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Flash Sale Live
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-4">
                Elevate Your Style
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-[#d9e2ff] mb-8">
                Save up to 40%
              </p>

               {/* Countdown timer */}
                <div className="flex gap-2 sm:gap-3 mb-8">
                  {[
                    { value: String(countdown.hours).padStart(2, '0'), label: 'HOURS' },
                    { value: String(countdown.minutes).padStart(2, '0'), label: 'MINUTES' },
                    { value: String(countdown.seconds).padStart(2, '0'), label: 'SECONDS' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center">
                      <div
                        className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <span className="text-xl sm:text-2xl font-bold text-white">{item.value}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-white/50 mt-1.5 sm:mt-2 tracking-wider uppercase">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

              <Link
                to="/shop"
                className="inline-flex items-center px-8 py-3.5 rounded-xl text-[#141b2b] font-bold text-sm bg-white hover:bg-gray-100 transition-colors shadow-lg"
              >
                Claim Your Offer
              </Link>
            </div>

            {/* Right - Featured product card with glass-morphism */}
            <div className="flex-1 max-w-md w-full">
              <div
                className="rounded-3xl p-6 backdrop-blur-md border border-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#1a2540] mb-5">
                  {featuredProducts[0]?.images?.[0] ? (
                    <img
                      src={convertGoogleDriveLink(featuredProducts[0].images[0])}
                      alt={featuredProducts[0].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FabricFabricIcon />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold text-lg">{featuredProducts[0]?.name || 'Premium Silk Fabric'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold text-xl">
                        ₹{featuredProducts[0]
                          ? Math.round(featuredProducts[0].price * (1 - featuredProducts[0].offerPercentage / 100))
                          : 599}
                      </span>
                      {featuredProducts[0]?.offerPercentage ? (
                        <>
                          <span className="text-white/40 line-through text-sm">
                            ₹{featuredProducts[0].price}
                          </span>
                          <span className="text-xs bg-[#ff007a] text-white px-2 py-0.5 rounded-md font-bold">
                            -{featuredProducts[0].offerPercentage}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs bg-[#ff6b00] text-white px-2 py-0.5 rounded-md font-bold">
                          -40%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-[#0057c2] text-white px-3 py-1 rounded-lg font-bold">
                    LIMITED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORY SHOWCASE ============ */}
      <section className="bg-white py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191c1e] tracking-tight mb-4">
              Our  Collections
            </h2>
            <p className="text-[#45464c] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our curated range of premium fabrics, from traditional weaves to contemporary designs, crafted for every occasion.
            </p>
          </div>

           {/* Fabric Collections - from admin banners in a row of 3 equal boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {collectionBanners.length > 0 ? (
              collectionBanners.slice(0, 3).map((banner) => (
                <Link
                  key={banner.id || banner._id}
                  to={banner.link || '/shop'}
                  className="relative h-[280px] md:h-[400px] rounded-3xl overflow-hidden group"
                >
                  <img
                    src={convertGoogleDriveLink(banner.image)}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {banner.title.replace(/\\n/g, ' ')}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-white/60 text-xs md:text-sm">{banner.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-2 text-white text-sm font-semibold mt-2 group-hover:gap-3 transition-all">
                      Explore Collection <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              /* Fallback when no banners */
              <div className="md:col-span-3 text-center py-16">
                <p style={{ color: '#76777d' }}>No collections found. Add banners in the admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ PRODUCT CAROUSEL ============ */}
      <section className="bg-[#f7f9fb] py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20">
          {/* Header with nav arrows */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold text-[#191c1e] tracking-tight mb-3">
                Curated Selections
              </h2>
              <p className="text-[#45464c] text-base md:text-lg max-w-md leading-relaxed">
                Our editors' pick of the finest fabrics hitting the shelves this season.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-12 h-12 rounded-full border border-[#c6c6cd] flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-12 h-12 rounded-full border border-[#c6c6cd] flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                aria-label="Scroll right"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* Horizontal scrollable product cards */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {curatedProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[280px] md:w-[300px] snap-start">
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.includes(product.id)}
                />
              </div>
            ))}

            {/* Fallback cards if no products */}
            {curatedProducts.length === 0 && (
              <>
                {['Premium Cotton Fabric', 'Silk Blend Material', 'Embroidered Georgette', 'Pure Linen Fabric', 'Viscose Crepe', 'Designer Print Fabric'].map(
                  (name, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[280px] md:w-[300px] bg-white rounded-2xl border border-[rgba(0,0,0,0.05)] overflow-hidden shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)]"
                    >
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        <FabricFabricIcon />
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-semibold text-[#0057c2] uppercase tracking-wider mb-1">Fabric</p>
                        <h3 className="font-semibold text-[#191c1e] text-lg mb-1">{name}</h3>
                        <p className="text-[#45464c] text-sm">Premium quality</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-[#191c1e]">₹{(500 + i * 200).toFixed(2)}</span>
                          <span className="text-xs text-[#76777d] line-through">₹{(700 + i * 200).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-[#f2f4f6] py-16 md:py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left side */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#191c1e] tracking-tight mb-6 leading-[1.1]">
                Trusted by<br />500+ Customers
              </h2>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-[#45464c] text-lg font-medium">
                4.9/5 Average Rating
              </p>
              <p className="text-[#76777d] text-sm mt-2">
                Based on 12,000+ verified reviews
              </p>
            </div>

            {/* Right side - Testimonial cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-3xl p-8 shadow-[0px_20px_50px_0px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0057c2] to-[#7b61ff] flex items-center justify-center text-white font-bold text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#191c1e]">{t.name}</h4>
                      <p className="text-[#76777d] text-sm">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-[#45464c] leading-relaxed text-[15px]">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 1L12.39 6.36L18.18 7.18L13.82 11.18L15.18 17L10 14.27L4.82 17L6.18 11.18L1.82 7.18L7.61 6.36L10 1Z" fill="#F59E0B" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}

              {/* Extra testimonials from real data if available */}
              {products.slice(0, 2).map((_, i) => (
                <div
                  key={`extra-${i}`}
                  className="bg-white rounded-3xl p-8 shadow-[0px_20px_50px_0px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 1L12.39 6.36L18.18 7.18L13.82 11.18L15.18 17L10 14.27L4.82 17L6.18 11.18L1.82 7.18L7.61 6.36L10 1Z" fill="#F59E0B" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#45464c] leading-relaxed text-[15px] mb-6">
                    "Absolutely love the quality of fabrics. The {products[i + 2]?.name || 'silk collection'} is stunning and delivery was super fast. Highly recommended!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f7f9fb] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#0057c2]">
                        <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2 18C2 14.5 5.5 12 10 12C14.5 12 18 14.5 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#191c1e] text-sm">Customer Review</p>
                      <p className="text-[#76777d] text-xs">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES STRIP ============ */}
      <section className="bg-white border-t border-b border-[rgba(0,0,0,0.06)] py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20">
          <h3 className="text-center text-xs font-bold text-[#76777d] tracking-[0.2em] uppercase mb-8">
            Our Fabric Categories
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 justify-start md:justify-center flex-wrap md:flex-nowrap"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.length > 0
              ? allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop/${cat.slug}`}
                    className="flex-shrink-0 px-6 py-3 rounded-full border border-[rgba(0,0,0,0.08)] text-sm font-medium text-[#45464c] hover:border-[#0057c2] hover:text-[#0057c2] transition-colors whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))
              : categoryPills.map((cat) => (
                  <Link
                    key={cat}
                    to={`/shop/${cat.toLowerCase()}`}
                    className="flex-shrink-0 px-6 py-3 rounded-full border border-[rgba(0,0,0,0.08)] text-sm font-medium text-[#45464c] hover:border-[#0057c2] hover:text-[#0057c2] transition-colors whitespace-nowrap"
                  >
                    {cat}
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER / CTA SECTION ============ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #141b2b 0%, #0d1525 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,87,194,0.5) 0%, rgba(0,87,194,0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(123,97,255,0.5) 0%, rgba(123,97,255,0) 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Stay Updated
          </h2>
          <p className="text-[#a0a4b0] text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Get the latest fabric collections, exclusive offers, and design inspiration delivered to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input') as HTMLInputElement;
              if (input?.value) {
                alert('Thank you for subscribing!');
                input.value = '';
              }
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-1 focus:ring-[#0057c2] transition-all"
            />
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#0057c2] to-[#4d6dff] hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
