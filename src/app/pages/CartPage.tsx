import { useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { config } from '../config/env';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useApp();

  const getDiscountedPrice = (price: number, offerPercentage: number) => {
    return price - (price * (offerPercentage || 0) / 100);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
    return sum + (discountedPrice * item.cartQuantity);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f7f9fb]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header Banner */}
      <div className="bg-[#141b2b] border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-[#a0a4b0] mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ShoppingBag size={36} className="text-[#76777d]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#191c1e] mb-2">Your cart is empty</h2>
            <p className="text-[#76777d] mb-8 max-w-sm">
              Looks like you haven't added any fabrics yet. Browse our collection to find what you need.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
                const itemTotal = discountedPrice * item.cartQuantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-4 md:p-6"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product Image */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-[8px] overflow-hidden bg-[#f2f4f6] flex-shrink-0">
                        <img
                          src={convertGoogleDriveLink(item.images?.[0] || '')}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-[#191c1e] leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[#76777d] mt-0.5">
                              SKU: {item.sku}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3 md:mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                 const isFabric = item.productType === 'fabric' || (!item.productType && item.unit !== 'pieces');
                                 updateQuantity(item.id, Math.max(isFabric ? 2 : 1, item.cartQuantity - 1));
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-lg border-2 border-[#0057c2] flex items-center justify-center text-[#0057c2] hover:bg-[#0057c2] hover:text-white transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[#191c1e]">
                              {item.cartQuantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-lg border-2 border-[#0057c2] flex items-center justify-center text-[#0057c2] hover:bg-[#0057c2] hover:text-white transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {item.offerPercentage > 0 && (
                              <p className="text-xs text-[#76777d] line-through">
                                {config.currency.symbol}{(item.price * item.cartQuantity).toFixed(2)}
                              </p>
                            )}
                            <p className="text-sm md:text-base font-bold text-[#0057c2]">
                              {config.currency.symbol}{itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-6 md:p-8">
                <h2 className="text-base md:text-lg font-normal text-[#191c1e] mb-6">
                  Order Summary
                </h2>

                {/* Cart Items Preview */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => {
                    const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-[8px] overflow-hidden bg-[#f2f4f6] flex-shrink-0">
                          <img
                            src={convertGoogleDriveLink(item.images?.[0] || '')}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#191c1e] truncate">{item.name}</p>
                          <p className="text-xs text-[#76777d]">Qty: {item.cartQuantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#191c1e] flex-shrink-0">
                          {config.currency.symbol}{(discountedPrice * item.cartQuantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#76777d]">Subtotal</span>
                    <span className="font-medium text-[#191c1e]">{config.currency.symbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-[#76777d]">
                    Shipping & taxes calculated at checkout
                  </p>

                  {/* Total */}
                  <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#191c1e]">Total</span>
                    <span className="text-lg font-bold text-[#191c1e]">{config.currency.symbol}{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full h-[56px] bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </button>
                  <Link
                    to="/shop"
                    className="block w-full h-[56px] border-2 border-[#e5e7eb] text-[#45464c] rounded-full font-semibold text-sm hover:border-[#0057c2] hover:text-[#0057c2] transition-all text-center leading-[56px]"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-xs text-[#76777d]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#76777d]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
