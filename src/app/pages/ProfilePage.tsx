import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Edit2, MapPin, Phone, Mail, LogOut, ChevronRight, Package, Heart, Settings, User, ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';
import { useApp } from '../context/AppContext';
import { NoiseButton } from '@/components/ui/noise-button';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { orders, wishlist } = useApp();
  const profileRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    joinedDate: new Date().toLocaleDateString()
  });

  useEffect(() => {
    const stored = localStorage.getItem('userEmail');
    if (stored) {
      setUserEmail(stored);
      setUserData(prev => ({
        ...prev,
        email: stored,
        name: stored.split('@')[0],
      }));
    } else {
      navigate('/checkout');
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(profileRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, profileRef);

    return () => ctx.revert();
  }, [navigate]);

  const userOrders = orders.filter(
    order => order.customerEmail.toLowerCase() === userEmail.toLowerCase()
  );

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-white py-8 md:py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Package size={80} className="mx-auto mb-6 opacity-30" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Sign In to Your Profile</h1>
          <p className="text-lg opacity-70 mb-8">
            You need to sign in to view your profile and orders.
          </p>
          <NoiseButton
            onClick={() => navigate('/checkout')}
            containerClassName="w-fit"
          >
            Continue Shopping
          </NoiseButton>
        </div>
      </div>
    );
  }

  return (
    <div ref={profileRef} className="min-h-screen bg-[#f7f9fb]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header Banner */}
      <div className="bg-[#141b2b] border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                My Profile
              </h1>
              <p className="text-sm text-[#a0a4b0] mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                isEditing
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Edit2 size={16} />
              {isEditing ? 'Save' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 md:gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#0057c2] to-[#846dff] p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold backdrop-blur-sm">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl md:text-2xl font-bold">{userData.name}</h2>
                    <p className="text-white/80 text-sm mt-1">{userData.email}</p>
                    <p className="text-white/60 text-xs mt-1">Member since {userData.joinedDate}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#191c1e]">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-[#0057c2] text-white"
                  >
                    <Edit2 size={14} />
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                      />
                    ) : (
                      <p className="text-sm font-medium text-[#191c1e] py-3">{userData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-[#191c1e] py-3">{userData.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-sm font-medium text-[#191c1e] py-3">{userData.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="mt-6 w-full md:hidden bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white py-3.5 rounded-full font-semibold text-sm hover:shadow-lg transition-all"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#191c1e] mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-[#0057c2]" />
                Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address.street}
                      onChange={(e) => setUserData({
                        ...userData,
                        address: { ...userData.address, street: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                      placeholder="Enter your street address"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#191c1e] py-2">{userData.address.street || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address.city}
                      onChange={(e) => setUserData({
                        ...userData,
                        address: { ...userData.address, city: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                      placeholder="Enter your city"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#191c1e] py-2">{userData.address.city || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address.state}
                      onChange={(e) => setUserData({
                        ...userData,
                        address: { ...userData.address, state: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                      placeholder="Enter your state"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#191c1e] py-2">{userData.address.state || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">ZIP Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address.zipCode}
                      onChange={(e) => setUserData({
                        ...userData,
                        address: { ...userData.address, zipCode: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0057c2] focus:ring-2 focus:ring-[#0057c2]/10 transition-all"
                      placeholder="Enter your ZIP code"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#191c1e] py-2">{userData.address.zipCode || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#76777d] mb-2 uppercase tracking-wider">Country</label>
                  <p className="text-sm font-medium text-[#191c1e] py-2">{userData.address.country}</p>
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className="mt-6 w-full bg-gradient-to-r from-[#0057c2] to-[#846dff] text-white py-3.5 rounded-full font-semibold text-sm hover:shadow-lg transition-all"
                >
                  Save Address Changes
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#76777d] uppercase tracking-wider mb-4">Overview</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-medium text-[#0057c2] opacity-80">Total Orders</p>
                      <p className="text-2xl font-bold text-[#0057c2]">{userOrders.length}</p>
                    </div>
                    <Package size={24} className="text-[#0057c2] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-medium text-red-600 opacity-80">Wishlist Items</p>
                      <p className="text-2xl font-bold text-red-600">{wishlist.length}</p>
                    </div>
                    <Heart size={24} className="text-red-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#76777d] uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-[#76777d]" />
                    <span className="text-sm font-medium text-[#191c1e]">My Orders</span>
                  </div>
                  <ChevronRight size={16} className="text-[#76777d] opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-[#76777d]" />
                    <span className="text-sm font-medium text-[#191c1e]">Wishlist</span>
                  </div>
                  <ChevronRight size={16} className="text-[#76777d] opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-[#76777d]" />
                    <span className="text-sm font-medium text-[#191c1e]">Shopping Cart</span>
                  </div>
                  <ChevronRight size={16} className="text-[#76777d] opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Store size={18} className="text-[#76777d]" />
                    <span className="text-sm font-medium text-[#191c1e]">Continue Shopping</span>
                  </div>
                  <ChevronRight size={16} className="text-[#76777d] opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
