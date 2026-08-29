import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { Percent, Tag, ArrowRight } from 'lucide-react';
import { config } from '../config/env';

export default function DealsPage() {
  const { products } = useApp();
  const [dealProducts, setDealProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter products with offers/discounts
    const deals = products.filter(p => p.offerPercentage > 0);
    // Sort by highest discount
    deals.sort((a, b) => b.offerPercentage - a.offerPercentage);
    setDealProducts(deals);
    setLoading(false);
  }, [products]);

  const calculateDiscountedPrice = (price: number, offerPercentage: number) => {
    return price - (price * offerPercentage / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#0057c2] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#45464c] mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0057c2] to-[#0047a0] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Percent size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Hot Deals & Offers
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Grab these amazing discounts before they're gone! Up to 60% off on premium fabrics and sarees.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/90">
            <Tag size={20} />
            <span className="text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              {dealProducts.length} products on sale
            </span>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {dealProducts.length === 0 ? (
          <div className="text-center py-16">
            <Percent size={48} className="text-[#0057c2] mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-[#191c1e] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              No deals available right now
            </h2>
            <p className="text-[#76777d] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Check back soon for amazing offers on our products
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0057c2] text-white font-medium rounded-full hover:bg-[#0047a0] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse Shop
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dealProducts.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={convertGoogleDriveLink(product.images?.[0] || '')}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{product.offerPercentage}% OFF
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-[#191c1e] mb-2 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-[#0057c2]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {config.currency.symbol}{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-[#76777d] line-through" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {config.currency.symbol}{product.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Stock: {product.quantity} {product.unit}
                        </span>
                        <span className="text-xs text-[#0057c2] font-medium group-hover:underline" style={{ fontFamily: 'Inter, sans-serif' }}>
                          View Deal
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Want More Savings?
                </h2>
                <p className="text-[#76777d] mb-6 max-w-xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Subscribe to our newsletter and get exclusive deals, early access to sales, and special discounts delivered to your inbox.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#0057c2] text-white font-medium rounded-full hover:bg-[#0047a0] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Shop All Products
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}