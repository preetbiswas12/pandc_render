import { useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, Clock, Truck, XCircle, Package, X, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Order } from '../../services/database-supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminOrders() {
  const { orders, products, updateOrderStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fabricCount = products.filter(p => p.productType === 'fabric').length;
  const pieceCount = products.filter(p => p.productType === 'saree' || p.productType === 'unstitched-suit-sets' || p.productType === 'handloom').length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'processing': return { bg: '#dbeafe', text: '#1e40af' };
      case 'shipped': return { bg: '#ede9fe', text: '#7c3aed' };
      case 'delivered': return { bg: '#d1fae5', text: '#065f46' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
    }
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
    const colors = getStatusColor(status);
    return { backgroundColor: colors.bg, color: colors.text };
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: Math.round(dayRevenue)
      });
    }
    return data;
  }, [orders]);

  return (
    <div className="space-y-6 w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#191c1e' }}>Orders</h1>
        <p style={{ color: '#76777d' }}>{orderStats.total} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-8 gap-4">
        {[
          { label: 'Total', value: orderStats.total, icon: <ShoppingCart />, color: '#45464c' },
          { label: 'Pending', value: orderStats.pending, icon: <Clock />, color: '#92400e' },
          { label: 'Processing', value: orderStats.processing, icon: <Package />, color: '#1e40af' },
          { label: 'Shipped', value: orderStats.shipped, icon: <Truck />, color: '#7c3aed' },
          { label: 'Delivered', value: orderStats.delivered, icon: <CheckCircle />, color: '#065f46' },
          { label: 'Cancelled', value: orderStats.cancelled, icon: <XCircle />, color: '#991b1b' },
          { label: 'Fabrics', value: fabricCount, icon: <Package />, color: '#0057c2' },
          { label: 'Sarees & Suits', value: pieceCount, icon: <Package />, color: '#7c3aed' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div style={{ color: item.color }}>{item.icon}</div>
            <p className="text-sm mt-2" style={{ color: '#76777d' }}>{item.label}</p>
            <p className="text-2xl font-bold" style={{ color: '#191c1e' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#191c1e' }}>Order Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" style={{ fontSize: '12px', fill: '#76777d' }} />
              <YAxis style={{ fontSize: '12px', fill: '#76777d' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#0057c2" strokeWidth={2} dot={{ fill: '#0057c2', r: 4 }} />
              <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#76777d' }} size={18} />
          <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2] text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2] text-sm" style={{ color: '#45464c' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: '#f7f9fb' }}>
                <th className="p-3 text-left whitespace-nowrap font-semibold" style={{ color: '#45464c' }}>Order</th>
                <th className="p-3 text-left whitespace-nowrap font-semibold" style={{ color: '#45464c' }}>Customer</th>
                <th className="p-3 text-left whitespace-nowrap font-semibold" style={{ color: '#45464c' }}>Total</th>
                <th className="p-3 text-left whitespace-nowrap font-semibold" style={{ color: '#45464c' }}>Status</th>
                <th className="p-3 text-center whitespace-nowrap font-semibold" style={{ color: '#45464c' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id || order._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 whitespace-nowrap" style={{ color: '#191c1e' }}>{order.orderNumber}</td>
                  <td className="p-3 whitespace-nowrap" style={{ color: '#191c1e' }}>{order.customerName}</td>
                  <td className="p-3 whitespace-nowrap font-medium" style={{ color: '#191c1e' }}>₹{order.total}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusBadgeStyle(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-full hover:bg-gray-100 transition-colors inline-flex items-center justify-center">
                      <Eye size={18} style={{ color: '#45464c' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-[990]" style={{ backgroundColor: 'rgba(20,27,43,0.5)' }} onClick={() => setSelectedOrder(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-xl z-[999]"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#191c1e' }}>{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} style={{ color: '#76777d' }} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p style={{ color: '#45464c' }}><span className="font-semibold" style={{ color: '#191c1e' }}>Name:</span> {selectedOrder.customerName}</p>
              <p style={{ color: '#45464c' }}><span className="font-semibold" style={{ color: '#191c1e' }}>Email:</span> {selectedOrder.customerEmail}</p>
              <p style={{ color: '#45464c' }}><span className="font-semibold" style={{ color: '#191c1e' }}>Total:</span> <span className="font-bold" style={{ color: '#0057c2' }}>₹{selectedOrder.total}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Update Status</label>
              <select value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder.id || selectedOrder._id, e.target.value as Order['status'])}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0057c2] text-sm">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
