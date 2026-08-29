import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NoiseButton } from '@/components/ui/noise-button';
import type { Order } from '../services/database-supabase';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const { orders } = useApp();

  const myOrders = useMemo(() => {
    if (!userEmail) return [];

    const userOrders = orders.filter(
      order => order.customerEmail.toLowerCase() === userEmail.toLowerCase()
    );

    return [...userOrders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, userEmail]);

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock size={20} style={{ color: '#f59e0b' }} />,
          title: 'Pending',
          bg: 'rgba(245,158,11,0.1)',
          color: '#b45309',
          border: 'rgba(245,158,11,0.2)',
        };
      case 'processing':
        return {
          icon: <Package size={20} style={{ color: '#0057c2' }} />,
          title: 'Processing',
          bg: 'rgba(0,87,194,0.1)',
          color: '#0057c2',
          border: 'rgba(0,87,194,0.2)',
        };
      case 'shipped':
        return {
          icon: <Truck size={20} style={{ color: '#7c3aed' }} />,
          title: 'Shipped',
          bg: 'rgba(124,58,237,0.1)',
          color: '#7c3aed',
          border: 'rgba(124,58,237,0.2)',
        };
      case 'delivered':
        return {
          icon: <CheckCircle size={20} style={{ color: '#16a34a' }} />,
          title: 'Delivered',
          bg: 'rgba(22,163,74,0.1)',
          color: '#16a34a',
          border: 'rgba(22,163,74,0.2)',
        };
      case 'cancelled':
        return {
          icon: <XCircle size={20} style={{ color: '#ef4444' }} />,
          title: 'Cancelled',
          bg: 'rgba(239,68,68,0.1)',
          color: '#ef4444',
          border: 'rgba(239,68,68,0.2)',
        };
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('userEmail');
    if (stored) setUserEmail(stored);
  }, []);

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] py-8 md:py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(0,87,194,0.08)' }}
            >
              <Package size={40} style={{ color: '#0057c2', opacity: 0.5 }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#191c1e] tracking-tight mb-4">
              Enter Email to View Orders
            </h1>
            <p className="text-[#76777d] text-lg mb-8 max-w-md mx-auto">
              Enter the email address used during checkout to view your order history.
            </p>
            <NoiseButton onClick={() => navigate('/checkout')} containerClassName="w-fit">
              Go to Checkout
            </NoiseButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-4 md:py-6 lg:py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191c1e] tracking-tight mb-1">
            My Orders
          </h1>
          <p className="text-sm text-[#76777d]">{userEmail}</p>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 lg:p-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(0,87,194,0.08)' }}
            >
              <Package size={28} style={{ color: '#0057c2', opacity: 0.5 }} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#191c1e] mb-3">No Orders Found</h2>
            <p className="text-[#76777d] mb-8 max-w-sm mx-auto">
              You haven't placed any orders yet. Start shopping now!
            </p>
            <NoiseButton onClick={() => navigate('/shop')} containerClassName="w-fit">
              Start Shopping
            </NoiseButton>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id || order._id}
                  onClick={() => navigate(`/order/${order.id || order._id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 lg:p-8 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-1">
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-[#191c1e] truncate">
                          {order.orderNumber}
                        </h3>
                        <ChevronRight
                          size={18}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          style={{ color: '#0057c2' }}
                        />
                      </div>
                      <p className="text-sm text-[#76777d]">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        borderColor: statusInfo.border,
                      }}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.title}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center gap-3 mb-4 md:mb-6 overflow-x-auto pb-1">
                    {order.items.slice(0, 4).map((item, index) => (
                      <div
                        key={item.productId || item.id || `item-${index}`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-[#f7f9fb] flex-shrink-0 border border-gray-100"
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center flex-shrink-0 border border-dashed"
                        style={{ backgroundColor: '#f7f9fb', borderColor: '#e5e7eb' }}
                      >
                        <span className="text-sm font-semibold" style={{ color: '#0057c2' }}>
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <div className="space-y-1">
                      <p className="text-sm text-[#76777d]">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-[#76777d]">
                        Payment:{' '}
                        <span className="capitalize font-medium" style={{ color: '#45464c' }}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#76777d] mb-0.5">Total Amount</p>
                      <p className="text-xl md:text-2xl font-bold text-[#191c1e]">
                        ₹{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
