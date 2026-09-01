import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { config } from '../config/env';
import { calculateShippingCharge, validatePincodeFormat } from '../services/shiprocket';
import { supabase } from '../services/database-supabase';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { initiateRazorpayPayment } from '../services/razorpay';
import { Loader2, ChevronRight, Tag, Shield, Truck, ArrowLeft, Smartphone, Check } from 'lucide-react';

const COLORS = {
  blue: '#0057c2',
  dark: '#141b2b',
  light: '#f7f9fb',
  text: '#191c1e',
  secondary: '#45464c',
  muted: '#76777d',
  border: '#e5e7eb',
  input: '#f2f4f6',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart, createOrder } = useApp();

  const [currentStep, setCurrentStep] = useState(2); // 1=Cart (done), 2=Shipping, 3=Payment, 4=Review
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingMessage, setShippingMessage] = useState<string>('Enter pincode to calculate shipping');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingAvailable, setShippingAvailable] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [availableCoupons, setAvailableCoupons] = useState<Array<{ code: string; discount_type: string; discount_value: number; min_order_value: number }>>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }
    loadCoupons();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems.length, navigate]);

  const loadCoupons = async () => {
    const { data } = await supabase.from('coupons').select('code, discount_type, discount_value, min_order_value, is_active').eq('is_active', true);
    if (data) setAvailableCoupons(data);
  };

  const getDiscountedPrice = (price: number, offerPercentage: number) => {
    return price - (price * (offerPercentage || 0) / 100);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
    return sum + (discountedPrice * item.cartQuantity);
  }, 0);
  const shipping = shippingAvailable ? shippingCost : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tax = 0;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  useEffect(() => {
    const zipCode = formData.zipCode?.trim();
    if (!zipCode) {
      setShippingCost(0);
      setShippingMessage('Enter pincode to calculate shipping');
      setShippingAvailable(false);
      return;
    }
    if (!validatePincodeFormat(zipCode)) {
      setShippingCost(0);
      setShippingMessage('Invalid pincode (6 digits required)');
      setShippingAvailable(false);
      return;
    }
    setIsCalculatingShipping(true);
    const timer = setTimeout(async () => {
      try {
        const totalItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);
        const estimatedWeight = Math.max(0.5, totalItems * 0.5);
        const result = await calculateShippingCharge(zipCode, estimatedWeight, subtotal, cartItems);
        setShippingCost(result.cost);
        setShippingMessage(result.message);
        setShippingAvailable(result.available);
      } catch {
        setShippingCost(0);
        setShippingMessage('Unable to calculate shipping');
        setShippingAvailable(false);
      } finally {
        setIsCalculatingShipping(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.zipCode, cartItems, subtotal]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (subtotal < coupon.min_order_value) {
      setCouponError(`Minimum order value ${config.currency.symbol}${coupon.min_order_value} required`);
      return;
    }
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }
    setAppliedCoupon({ code: coupon.code, discount: discountAmount });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingNext = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please fill in all shipping fields');
      return;
    }
    if (!shippingAvailable) {
      alert('Shipping is not available to your location');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentNext = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentBack = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewBack = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompletePurchase = async () => {
    if (isProcessing || cartItems.length === 0) return;

    if (paymentMethod === 'razorpay') {
      setIsProcessing(true);
      try {
        await initiateRazorpayPayment({
          amount: total,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          orderDetails: `Order from P&C Texfab - ${cartItems.length} items`,
          onSuccess: async (paymentId) => {
            try {
              const order = await createOrder({
                customerName: formData.fullName,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: {
                  street: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  country: formData.country
                },
                items: cartItems.map(item => ({
                  productId: item.id,
                  productName: item.name,
                  sku: item.sku,
                  quantity: item.cartQuantity,
                  price: getDiscountedPrice(item.price, item.offerPercentage || 0),
                  originalPrice: item.price,
                  offerPercentage: item.offerPercentage || 0,
                  image: item.images[0]
                })),
                subtotal,
                discount,
                shipping,
                total,
                couponCode: appliedCoupon?.code,
                status: 'pending',
                paymentStatus: 'completed',
                paymentMethod: 'razorpay',
                paymentId
              });

              localStorage.setItem('userEmail', formData.email);
              clearCart();
              navigate(`/order-confirmation/${order.id}?payment=success&paymentId=${paymentId}`);
            } catch (error) {
              alert('Failed to place order. Please try again.');
              setIsProcessing(false);
            }
          },
          onFailure: (error) => {
            alert('Payment failed: ' + (error?.description || error?.message || 'Please try again.'));
            setIsProcessing(false);
          },
          onDismiss: () => {
            setIsProcessing(false);
          }
        });
      } catch (error) {
        alert('Failed to initialize payment. Please try again.');
        setIsProcessing(false);
      }
      return;
    }
  };

  const steps = [
    { num: 1, label: 'Cart' },
    { num: 2, label: 'Shipping' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Review' },
  ];

  const getStepStatus = (stepNum: number) => {
    if (stepNum < currentStep) return 'completed';
    if (stepNum === currentStep) return 'active';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="bg-[#141b2b] border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Checkout</h1>
              <p className="text-sm text-[#a0a4b0]">{cartItems.length} items in your order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[672px] mx-auto px-3 py-4 sm:py-6">
          <div className="flex items-center justify-center">
            {steps.map((s, i) => {
              const status = getStepStatus(s.num);
              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                      status === 'completed' ? 'bg-green-500 text-white' :
                      status === 'active' ? 'bg-[#0057c2] text-white' :
                      'bg-[#e5e7eb] text-[#76777d]'
                    }`}>
                      {status === 'completed' ? <Check size={14} className="sm:hidden" /> : <Check size={18} className="hidden sm:block" />}
                      {status !== 'completed' && s.num}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium tracking-wide ${
                      status === 'active' ? 'text-[#0057c2]' :
                      status === 'completed' ? 'text-green-600' :
                      'text-[#76777d]'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`w-6 sm:w-16 md:w-24 h-0.5 mx-1 sm:mx-2 ${
                      status === 'completed' || (status === 'active' && i > 0) ? 'bg-[#0057c2]' : 'bg-[#e5e7eb]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          {/* Left Column - Step Content */}
          <div>
            {/* STEP 2: Shipping Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#191c1e] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {[
                    { key: 'fullName', label: 'FULL NAME', placeholder: 'Rohan Rusho', col: 1 },
                    { key: 'email', label: 'EMAIL ADDRESS', placeholder: 'you@example.com', col: 2, type: 'email' },
                    { key: 'phone', label: 'PHONE NUMBER', placeholder: '+91 9804915374', col: 'full', type: 'tel' },
                    { key: 'address', label: 'SHIPPING ADDRESS', placeholder: '123 Innovation Drive, City, State', col: 'full', type: 'text' },
                  ].map((field) => (
                    <div key={field.key} className={field.col === 'full' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-[#76777d] mb-1.5 tracking-wide uppercase">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        required
                        value={formData[field.key as keyof typeof formData]}
                        onChange={e => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full h-[56px] px-4 bg-[#f2f4f6] rounded-[8px] text-sm text-[#191c1e] placeholder:text-[#a0a4b0] focus:outline-none focus:ring-2 focus:ring-[#0057c2] transition-all"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-[#76777d] mb-1.5 tracking-wide uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => updateField('city', e.target.value)}
                      placeholder="City"
                      className="w-full h-[56px] px-4 bg-[#f2f4f6] rounded-[8px] text-sm text-[#191c1e] placeholder:text-[#a0a4b0] focus:outline-none focus:ring-2 focus:ring-[#0057c2] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#76777d] mb-1.5 tracking-wide uppercase">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={e => updateField('state', e.target.value)}
                      placeholder="State"
                      className="w-full h-[56px] px-4 bg-[#f2f4f6] rounded-[8px] text-sm text-[#191c1e] placeholder:text-[#a0a4b0] focus:outline-none focus:ring-2 focus:ring-[#0057c2] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#76777d] mb-1.5 tracking-wide uppercase">Zip Code</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={e => updateField('zipCode', e.target.value)}
                      placeholder="6-digit pincode"
                      className="w-full h-[56px] px-4 bg-[#f2f4f6] rounded-[8px] text-sm text-[#191c1e] placeholder:text-[#a0a4b0] focus:outline-none focus:ring-2 focus:ring-[#0057c2] transition-all"
                    />
                    {!isCalculatingShipping && formData.zipCode && (
                      <p className={`mt-2 text-xs ${formData.zipCode.length === 6 && shippingAvailable ? 'text-green-600' : 'text-red-500'}`}>
                        {shippingMessage}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#76777d] mb-1.5 tracking-wide uppercase">Country</label>
                    <select
                      value={formData.country}
                      onChange={e => updateField('country', e.target.value)}
                      className="w-full h-[56px] px-4 bg-[#f2f4f6] rounded-[8px] text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#0057c2] transition-all"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Banner */}
                <div className="bg-[#141b2b] rounded-[12px] p-6 mt-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-base font-normal text-white mb-1">Express Delivery Expected</h3>
                    <p className="text-sm text-[rgba(125,132,151,0.8)]">
                      {shippingAvailable ? 'Arriving soon. Tracked and insured.' : 'Enter your pincode to see delivery estimates.'}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <Truck size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-wide">SECURE DELIVERY GUARANTEE</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleShippingNext}
                    className="px-8 py-3 bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {currentStep === 3 && (
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#191c1e] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Payment Method
                </h2>

                <div className="max-w-sm mx-auto">
                  <div className="p-5 rounded-[12px] border-2 border-[#0057c2] bg-[rgba(0,87,194,0.05)] text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                      <Smartphone size={20} className="text-[#0057c2]" />
                    </div>
                    <p className="text-sm font-bold text-[#191c1e]">Razorpay</p>
                    <p className="text-xs text-[#76777d] mt-1">UPI, Cards, Net Banking</p>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mt-8">
                  <h3 className="text-base font-semibold text-[#191c1e] mb-4">Coupon Code</h3>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#76777d]" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191c1e] placeholder:text-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0057c2] focus:border-[#0057c2] transition-all uppercase"
                      />
                    </div>
                    <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 bg-[#141b2b] text-white rounded-full text-sm font-medium hover:bg-black transition-colors whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="mt-3 flex items-center justify-between bg-green-50 text-green-700 px-4 py-2.5 rounded-lg">
                      <span className="text-sm font-medium">{appliedCoupon.code} applied</span>
                      <span className="text-sm font-bold">-{config.currency.symbol}{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handlePaymentBack}
                    className="px-6 py-3 border-2 border-[#e5e7eb] text-[#45464c] rounded-full font-semibold text-sm hover:border-[#0057c2] hover:text-[#0057c2] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentNext}
                    className="px-8 py-3 bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Continue to Review
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review Order */}
            {currentStep === 4 && (
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-[#191c1e] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Review Your Order
                </h2>

                {/* Shipping Summary */}
                <div className="bg-[#f7f9fb] rounded-[12px] p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#76777d] uppercase tracking-wide">Shipping Address</h3>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold text-[#0057c2] tracking-wide">
                      Change
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#191c1e]">{formData.fullName}</p>
                  <p className="text-sm text-[#45464c]">{formData.address}</p>
                  <p className="text-sm text-[#45464c]">{formData.city}, {formData.state} - {formData.zipCode}</p>
                  <p className="text-sm text-[#45464c]">{formData.country}</p>
                  <p className="text-sm text-[#45464c] mt-1">{formData.phone} | {formData.email}</p>
                </div>

                {/* Payment Summary */}
                <div className="bg-[#f7f9fb] rounded-[12px] p-5 mb-6">
                  <h3 className="text-sm font-semibold text-[#76777d] uppercase tracking-wide mb-3">Payment Method</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                      <Smartphone size={18} className="text-[#0057c2]" />
                    </div>
                    <span className="text-sm font-medium text-[#191c1e]">Razorpay (UPI, Cards, Net Banking)</span>
                  </div>
                </div>

                {/* Items to be ordered */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#76777d] uppercase tracking-wide mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {cartItems.map(item => {
                      const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-14 rounded-[8px] overflow-hidden bg-[#f2f4f6] flex-shrink-0">
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
                </div>

                {/* Order Total */}
                <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45464c]">Subtotal</span>
                    <span className="font-medium text-[#191c1e]">{config.currency.symbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#45464c]">Discount</span>
                      <span className="font-medium text-green-600">-{config.currency.symbol}{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45464c]">Shipping</span>
                    <span className="font-medium text-[#191c1e]">{shipping === 0 ? 'Free' : `${config.currency.symbol}${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-[rgba(0,0,0,0.06)] pt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-[#191c1e]">Total</span>
                    <span className="text-xl font-bold text-[#0057c2]">{config.currency.symbol}{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handleReviewBack}
                    className="px-6 py-3 border-2 border-[#e5e7eb] text-[#45464c] rounded-full font-semibold text-sm hover:border-[#0057c2] hover:text-[#0057c2] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCompletePurchase}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white rounded-full font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Purchase
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary (always visible) */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.02)] p-6 md:p-8">
              <h2 className="text-base font-normal text-[#191c1e] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map(item => {
                  const discountedPrice = getDiscountedPrice(item.price, item.offerPercentage || 0);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#f2f4f6] flex-shrink-0">
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

              <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#45464c]">Subtotal</span>
                  <span className="font-medium text-[#191c1e]">{config.currency.symbol}{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#45464c]">Discount</span>
                    <span className="font-medium text-green-600">-{config.currency.symbol}{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#45464c]">Shipping</span>
                  <span className={`font-medium ${shippingAvailable ? 'text-[#0057c2]' : 'text-[#76777d]'}`}>
                    {shippingAvailable ? (shipping === 0 ? 'Free' : `${config.currency.symbol}${shipping.toFixed(2)}`) : 'Calculating...'}
                  </span>
                </div>
                <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#191c1e]">Total</span>
                  <span className="text-lg font-bold text-[#191c1e]">{config.currency.symbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] p-4 flex flex-col items-center text-center">
                <div className="w-5 h-5 mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0057c2" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#191c1e] tracking-wide uppercase">Secure</span>
              </div>
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.06)] p-4 flex flex-col items-center text-center">
                <div className="w-5 h-5 mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0057c2" strokeWidth="2" className="w-5 h-5">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#191c1e] tracking-wide uppercase">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
