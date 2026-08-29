import { useState } from 'react';
import { Plus, Pencil, Trash2, X, FolderTree } from 'lucide-react';
import type { Category } from '../../services/database-supabase';
import { useApp } from '../../context/AppContext';

export default function AdminCategories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', slug: '', subCategories: [], isActive: true,
  });
  const [subCategoryInput, setSubCategoryInput] = useState({ name: '', slug: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) { await updateCategory(editingCategory.id || editingCategory._id, formData); }
    else { await createCategory(formData as Omit<Category, '_id' | 'createdAt' | 'updatedAt'>); }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) { await deleteCategory(id); }
  };

  const openModal = (category?: Category) => {
    if (category) { setEditingCategory(category); setFormData(category); }
    else { setEditingCategory(null); setFormData({ name: '', slug: '', subCategories: [], isActive: true }); }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSubCategoryInput({ name: '', slug: '' });
  };

  const addSubCategory = () => {
    if (subCategoryInput.name && subCategoryInput.slug) {
      setFormData({ ...formData, subCategories: [...(formData.subCategories || []), { ...subCategoryInput }] });
      setSubCategoryInput({ name: '', slug: '' });
    }
  };

  const removeSubCategory = (index: number) => {
    setFormData({ ...formData, subCategories: formData.subCategories?.filter((_, i) => i !== index) || [] });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleSubCategoryNameChange = (name: string) => {
    setSubCategoryInput({ name, slug: generateSlug(name) });
  };

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: '#191c1e' }}>Category Management</h1>
          <p className="text-xs sm:text-sm md:text-base" style={{ color: '#76777d' }}>Manage product categories and subcategories</p>
        </div>
        <button onClick={() => openModal()}
          className="w-full sm:w-auto text-white px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-full font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: '#0057c2' }}>
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id || category._id} category={category} onEdit={() => openModal(category)} onDelete={() => handleDelete(category.id || category._id)} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: '#f7f9fb' }}>
          <FolderTree className="w-12 h-12 mx-auto mb-3" style={{ color: '#76777d' }} />
          <p style={{ color: '#76777d' }}>No categories found</p>
          <button onClick={() => openModal()} className="mt-4 font-medium text-sm hover:underline" style={{ color: '#0057c2' }}>Create your first category</button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(20,27,43,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#191c1e' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={closeModal} className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors" style={{ color: '#76777d' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Category Name *</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Slug *</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]" style={{ backgroundColor: '#f7f9fb' }} />
                <p className="text-xs mt-1" style={{ color: '#76777d' }}>URL-friendly version (auto-generated)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Subcategories</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Subcategory name" value={subCategoryInput.name} onChange={(e) => handleSubCategoryNameChange(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                  <input type="text" placeholder="slug" value={subCategoryInput.slug} onChange={(e) => setSubCategoryInput({ ...subCategoryInput, slug: e.target.value })}
                    className="w-32 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0057c2]" style={{ backgroundColor: '#f7f9fb' }} />
                  <button type="button" onClick={addSubCategory}
                    className="text-white px-4 py-2.5 rounded-full hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#0057c2' }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.subCategories?.map((sub, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ backgroundColor: '#f7f9fb' }}>
                      <div>
                        <span className="font-medium" style={{ color: '#191c1e' }}>{sub.name}</span>
                        <span className="text-sm ml-2" style={{ color: '#76777d' }}>({sub.slug})</span>
                      </div>
                      <button type="button" onClick={() => removeSubCategory(index)} className="hover:opacity-80 transition-opacity" style={{ color: '#ef4444' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0057c2]" />
                <label htmlFor="isActive" className="text-sm font-medium" style={{ color: '#45464c' }}>Active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="flex-1 border-2 border-gray-300 px-4 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-all" style={{ color: '#45464c' }}>Cancel</button>
                <button type="submit" className="flex-1 text-white px-4 py-2.5 rounded-full font-medium hover:opacity-90 transition-all" style={{ backgroundColor: '#0057c2' }}>
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  category, onEdit, onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate" style={{ color: '#191c1e' }}>{category.name}</h3>
            {!category.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>Inactive</span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#76777d' }}>/{category.slug}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" style={{ color: '#45464c' }}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-full hover:bg-red-50 transition-colors" style={{ color: '#ef4444' }}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {category.subCategories.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-medium mb-2" style={{ color: '#76777d' }}>
            Subcategories ({category.subCategories.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {category.subCategories.map((sub, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#f7f9fb', color: '#45464c' }}>
                {sub.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
