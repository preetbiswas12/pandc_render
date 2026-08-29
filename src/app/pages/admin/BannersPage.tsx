import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import type { Banner } from '../../services/database-supabase';
import { useApp } from '../../context/AppContext';
import { convertGoogleDriveLink } from '../../../lib/googleDriveUtils';

export default function BannersPage() {
  const { banners, updateBanner } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    type: 'hero-side', title: '', subtitle: '', image: '', link: '', buttonText: '', isActive: true, order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) { await updateBanner(editingBanner.id || editingBanner._id, formData); }
    closeModal();
  };

  const openModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#191c1e' }}>Banner Management</h1>
        <p style={{ color: '#76777d' }}>Manage the 5 homepage banners. Click on any banner to edit its details.</p>
      </div>

      {/* Banner Type Info */}
      <div className="rounded-2xl p-4 mb-6 shadow-sm border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#1e3a8a' }}>Banner Types:</h3>
        <ul className="text-sm space-y-1" style={{ color: '#1e40af' }}>
          <li><strong>Hero Main:</strong> Large main banner on homepage (with subtitle and button)</li>
          <li><strong>Hero Side:</strong> Side banners on homepage (2 cards on the right)</li>
          <li><strong>Casual Inspiration:</strong> Banners in the Casual Inspirations section (with arrow button)</li>
        </ul>
      </div>

      {/* All Banners */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#191c1e' }}>All Banners ({sortedBanners.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBanners.map((banner) => (
            <BannerCard key={banner.id || banner._id} banner={banner} onEdit={() => openModal(banner)} />
          ))}
        </div>
        {sortedBanners.length === 0 && (
          <p className="text-center py-8" style={{ color: '#76777d' }}>No banners found</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(20,27,43,0.5)' }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold" style={{ color: '#191c1e' }}>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors" style={{ color: '#76777d' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Banner Type *</label>
                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Banner['type'] })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]">
                  <option value="hero-main">Hero Main (Large banner with button)</option>
                  <option value="hero-side">Hero Side (Side cards)</option>
                  <option value="casual-inspiration">Casual Inspiration (with arrow)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                  placeholder="Enter banner title" />
                <p className="text-xs mt-1" style={{ color: '#76777d' }}>Use \n for line breaks (e.g., "Say it\nwith Shirt")</p>
              </div>

              {formData.type === 'hero-main' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Subtitle</label>
                  <textarea value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                    rows={2} placeholder="Enter banner subtitle (optional)" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Image URL *</label>
                <input type="text" required value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                  placeholder="https://example.com/image.jpg or use Unsplash URL" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Link URL *</label>
                <input type="text" required value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                  placeholder="/shop or external URL" />
              </div>

              {formData.type === 'hero-main' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Button Text</label>
                  <input type="text" value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                    placeholder="VIEW COLLECTIONS" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Display Order *</label>
                <input type="number" required value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                  placeholder="0" min="0" />
                <p className="text-xs mt-1" style={{ color: '#76777d' }}>Lower numbers appear first</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0057c2]" />
                <label htmlFor="isActive" className="text-sm font-medium" style={{ color: '#45464c' }}>Active (Display on website)</label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="flex-1 border-2 border-gray-300 py-3 rounded-full font-medium hover:bg-gray-100 transition-all" style={{ color: '#45464c' }}>Cancel</button>
                <button type="submit" className="flex-1 text-white py-3 rounded-full font-semibold hover:opacity-90 transition-all" style={{ backgroundColor: '#0057c2' }}>
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerCard({
  banner, onEdit,
}: {
  banner: Banner;
  onEdit: () => void;
}) {
  const getBannerTypeLabel = (type: Banner['type']) => {
    switch (type) {
      case 'hero-main': return 'Hero Main';
      case 'hero-side': return 'Hero Side';
      case 'casual-inspiration': return 'Casual Inspiration';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-40">
        <img src={convertGoogleDriveLink(banner.image)} alt={banner.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{
            backgroundColor: banner.isActive ? '#059669' : '#9ca3af', color: '#fff'
          }}>
            {banner.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase" style={{ color: '#76777d' }}>{getBannerTypeLabel(banner.type)}</span>
            <h3 className="font-semibold text-lg truncate" style={{ color: '#191c1e' }}>{banner.title.replace(/\\n/g, ' ')}</h3>
            {banner.subtitle && (
              <p className="text-sm mt-1 line-clamp-2" style={{ color: '#76777d' }}>{banner.subtitle}</p>
            )}
          </div>
          <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0 ml-2" style={{ backgroundColor: '#f7f9fb', color: '#76777d' }}>
            Order: {banner.order}
          </span>
        </div>
        <div className="text-xs mb-3 truncate" style={{ color: '#76777d' }}>
          Link: <span className="font-mono">{banner.link}</span>
        </div>
        <button onClick={onEdit}
          className="w-full flex items-center justify-center gap-1 text-white px-3 py-2.5 rounded-full hover:opacity-90 transition-all text-sm font-medium"
          style={{ backgroundColor: '#0057c2' }}>
          <Pencil size={16} />Edit
        </button>
      </div>
    </div>
  );
}
