import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ShoppingCart, Package, Tag, Image, LogOut, FolderTree, FileText, RefreshCw, Menu, ChevronLeft } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: FileText, label: 'Guidelines', path: '/admin/guidelines' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAdmin();
  const { refreshAllData, products, orders, categories } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-[#f7f9fb] pt-16">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`${
          isMobile
            ? (isSidebarOpen ? 'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)]' : 'fixed -left-64 top-16 z-50')
            : 'relative'
        } w-64 bg-white border-r border-gray-100 flex flex-col transition-all duration-300`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0057c2] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#191c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>Admin</h2>
                <p className="text-xs text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard</p>
              </div>
            </div>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronLeft size={20} className="text-[#45464c]" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="p-4">
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-[#f7f9fb] rounded-xl transition-colors disabled:opacity-50 text-sm text-[#45464c]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-[#c6c6cd] tracking-wider uppercase px-4 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin');
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); if (isMobile) setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#0057c2]/10 text-[#0057c2] font-medium'
                      : 'text-[#45464c] hover:bg-[#f7f9fb] hover:text-[#191c1e]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Info and Logout */}
          <div className="border-t border-gray-100 space-y-2 p-4">
            {admin && (
              <div className="bg-[#f7f9fb] rounded-xl p-3 text-sm">
                <p className="text-[#c6c6cd] text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Logged in as</p>
                <p className="text-[#191c1e] font-medium truncate text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{admin.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all text-red-500 text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#f7f9fb] transition-all text-[#76777d] text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span>←</span>
              <span>Back to Store</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          <div className="p-4 md:p-8 min-h-screen">
            {/* Dashboard Overview (only show on /admin index) */}
            {location.pathname === '/admin' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#191c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard Overview</h1>
                    <p className="text-sm text-[#76777d] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Welcome to your admin panel</p>
                  </div>
                  <button
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-[#45464c] hover:bg-[#f7f9fb] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>Total Revenue</p>
                        <p className="text-2xl font-bold text-[#191c1e] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>₹{totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#0057c2]/10 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={24} className="text-[#0057c2]" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>Total Products</p>
                        <p className="text-2xl font-bold text-[#191c1e] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{totalProducts}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Package size={24} className="text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>Categories</p>
                        <p className="text-2xl font-bold text-[#191c1e] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{totalCategories}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <FolderTree size={24} className="text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#76777d]" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Orders</p>
                        <p className="text-2xl font-bold text-[#191c1e] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{pendingOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-[#191c1e] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {menuItems.filter(item => item.path !== '/admin').map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#0057c2]/20 hover:bg-[#0057c2]/5 transition-all"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <Icon size={24} className="text-[#0057c2]" />
                          <span className="text-sm font-medium text-[#45464c]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Orders Preview */}
                {orders && orders.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#191c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Orders</h3>
                      <button onClick={() => navigate('/admin/orders')} className="text-sm text-[#0057c2] hover:underline" style={{ fontFamily: 'Inter, sans-serif' }}>View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-[#76777d] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Order</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-[#76777d] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Customer</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-[#76777d] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Total</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-[#76777d] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-[#f7f9fb]">
                              <td className="py-3 px-4 text-sm font-medium text-[#191c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>#{order.orderNumber}</td>
                              <td className="py-3 px-4 text-sm text-[#45464c]" style={{ fontFamily: 'Inter, sans-serif' }}>{order.customerName}</td>
                              <td className="py-3 px-4 text-sm text-[#45464c]" style={{ fontFamily: 'Inter, sans-serif' }}>₹{order.total?.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                                  order.status === 'completed' ? 'bg-green-50 text-green-600' :
                                  order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                  'bg-yellow-50 text-yellow-600'
                                }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Child Routes */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
