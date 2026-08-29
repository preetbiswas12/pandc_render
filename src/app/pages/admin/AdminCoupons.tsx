import { useState } from 'react';
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Coupon } from '../../services/database-supabase';

export default function AdminCoupons() {
  const { coupons, createCoupon, updateCoupon, deleteCoupon: deleteCouponDB } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '',
      validFrom: '', validTo: '', usageLimit: '', isActive: true
    });
    setEditingCoupon(null);
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue.toString(),
        minOrderValue: coupon.minOrderValue.toString(), maxDiscount: coupon.maxDiscount?.toString() || '',
        validFrom: coupon.validFrom.split('T')[0], validTo: coupon.validTo.split('T')[0],
        usageLimit: coupon.usageLimit.toString(), isActive: coupon.isActive
      });
    } else { resetForm(); }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const couponData = {
      code: formData.code.toUpperCase(), discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue), minOrderValue: parseFloat(formData.minOrderValue),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      validFrom: new Date(formData.validFrom).toISOString(), validTo: new Date(formData.validTo).toISOString(),
      usageLimit: parseInt(formData.usageLimit), isActive: formData.isActive
    };
    if (editingCoupon) { updateCoupon(editingCoupon.id || editingCoupon._id, couponData); }
    else { createCoupon(couponData); }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) deleteCouponDB(id);
  };

  const toggleActive = (coupon: Coupon) => {
    updateCoupon(coupon.id || coupon._id, { isActive: !coupon.isActive });
  };

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2" style={{ color: '#191c1e' }}>Coupons</h1>
          <p className="text-xs sm:text-sm md:text-base" style={{ color: '#76777d' }}>{coupons.length} total coupons</p>
        </div>
        <button onClick={() => openModal()}
          className="w-full sm:w-auto text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: '#0057c2' }}>
          <Plus size={18} className="sm:w-5 sm:h-5" />Add Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.validTo) < new Date();
          const isNotYetValid = new Date(coupon.validFrom) > new Date();
          const usagePercentage = (coupon.usedCount / coupon.usageLimit) * 100;

          return (
            <div key={coupon.id || coupon._id} className="bg-white rounded-2xl p-4 sm:p-6 relative shadow-sm border border-gray-100">
              {/* Status Badge */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                {!coupon.isActive ? (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>Inactive</span>
                ) : isExpired ? (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>Expired</span>
                ) : isNotYetValid ? (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Upcoming</span>
                ) : (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Active</span>
                )}
              </div>

              {/* Coupon Code */}
              <div className="mb-4 pr-16 sm:pr-20">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="sm:w-5 sm:h-5" style={{ color: '#76777d' }} />
                  <h3 className="text-lg sm:text-2xl font-bold font-mono" style={{ color: '#191c1e' }}>{coupon.code}</h3>
                </div>
                <p className="text-xs sm:text-sm" style={{ color: '#76777d' }}>
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                  {coupon.maxDiscount && coupon.discountType === 'percentage' && ` (max ₹${coupon.maxDiscount})`}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <p className="text-sm" style={{ color: '#45464c' }}>
                  <span style={{ color: '#76777d' }}>Min. Order:</span> <span className="font-medium">₹{coupon.minOrderValue}</span>
                </p>
                <p className="text-sm" style={{ color: '#45464c' }}>
                  <span style={{ color: '#76777d' }}>Valid:</span> <span className="font-medium">
                    {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTo).toLocaleDateString()}
                  </span>
                </p>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#76777d' }}>Usage:</span>
                    <span className="font-medium" style={{ color: '#191c1e' }}>{coupon.usedCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e5e7eb' }}>
                    <div className="rounded-full h-2 transition-all" style={{ width: `${Math.min(usagePercentage, 100)}%`, backgroundColor: '#0057c2' }} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => toggleActive(coupon)}
                  className={`flex-1 px-4 py-2 rounded-full font-medium transition-all ${coupon.isActive ? 'hover:bg-gray-100' : 'hover:bg-green-50'}`}
                  style={coupon.isActive ? { backgroundColor: '#f3f4f6', color: '#45464c' } : { backgroundColor: '#d1fae5', color: '#065f46' }}>
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openModal(coupon)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{ border: '2px solid #0057c2', color: '#0057c2' }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(coupon.id || coupon._id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{ border: '2px solid #ef4444', color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-[990]" style={{ backgroundColor: 'rgba(20,27,43,0.5)' }} onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[999]"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#191c1e' }}>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} style={{ color: '#76777d' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Coupon Code *</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2] font-mono" placeholder="SAVE10" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Discount Type *</label>
                  <select required value={formData.discountType} onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input type="number" required step="0.01" min="0" max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue} onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Min Order Value (₹) *</label>
                  <input type="number" required step="0.01" min="0" value={formData.minOrderValue} onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Max Discount (₹)</label>
                    <input type="number" step="0.01" min="0" value={formData.maxDiscount} onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Valid From *</label>
                  <input type="date" required value={formData.validFrom} onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Valid To *</label>
                  <input type="date" required value={formData.validTo} onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Usage Limit *</label>
                  <input type="number" required min="1" value={formData.usageLimit} onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 accent-[#0057c2]" />
                    <span className="font-medium" style={{ color: '#45464c' }}>Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 border-2 border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all" style={{ color: '#45464c' }}>Cancel</button>
                <button type="submit" className="flex-1 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all" style={{ backgroundColor: '#0057c2' }}>
                  {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
