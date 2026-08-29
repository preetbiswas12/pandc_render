import { useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { convertGoogleDriveLink } from '../../../lib/googleDriveUtils';
import { GoogleDrivePicker } from '../../components/GoogleDrivePicker';
import { db } from '../../services/database-supabase';

export default function AdminProducts() {
  const { products, categories, createProduct, updateProduct, deleteProduct: deleteProductDB } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showGoogleDrivePicker, setShowGoogleDrivePicker] = useState(false);
  const [isAddProductDropdownOpen, setIsAddProductDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offerPercentage: '',
    images: '',
    category: '',
    subCategory: '',
    description: '',
    sku: '',
    quantity: '',
    width: '',
    unit: 'meters',
    productType: 'fabric',
    fabricType: '',
    sareeType: '',
    suitType: '',
    handloomType: '',
    length: '',
    careInstructions: '',
    colors: '',
    features: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      offerPercentage: '',
      images: '',
      category: '',
      subCategory: '',
      description: '',
      sku: '',
      quantity: '',
      width: '',
      length: '',
      unit: 'meters',
      productType: 'fabric',
      fabricType: '',
      sareeType: '',
      suitType: '',
      handloomType: '',
      careInstructions: '',
      colors: '',
      features: ''
    });
    setEditingProduct(null);
  };

  const isPieceType = (productType: string) => productType === 'saree';

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas context not available')); return; }
          const targetSize = 1080;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(resizedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const resizedImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) { alert(`${file.name} is not an image file`); continue; }
        const resizedDataUrl = await resizeImage(file);
        resizedImages.push(resizedDataUrl);
      }
      const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(Boolean) : [];
      const uniqueNew = resizedImages.filter(img => !currentImages.includes(img));
      const allImages = [...currentImages, ...uniqueNew];
      setFormData(prev => ({ ...prev, images: allImages.join(', ') }));
    } catch (error) {
      alert('Error uploading images: ' + (error as Error).message);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGoogleDriveImages = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(Boolean) : [];
    const uniqueNew = urls.filter(url => url && url.trim() && !currentImages.includes(url.trim()));
    const allImages = [...currentImages, ...uniqueNew];
    setFormData(prev => ({ ...prev, images: allImages.join(', ') }));
    setShowGoogleDrivePicker(false);
  };

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFormData(prev => {
      const isPieceType = type === 'saree' || type === 'unstitched-suit-sets' || type === 'handloom';
      if (isPieceType) {
        const categoryName = type === 'saree' ? 'saree' : type === 'unstitched-suit-sets' ? 'unstitched suit sets' : 'handloom';
        const category = categories.find(c => c.name.toLowerCase() === categoryName && c.isActive);
        return {
          ...prev,
          productType: type,
          unit: 'pieces',
          category: category ? category.id || category._id : prev.category,
          fabricType: '', sareeType: '', suitType: '', handloomType: '', width: '', length: ''
        };
      }
      return { ...prev, productType: type, unit: 'meters', fabricType: prev.fabricType || '', sareeType: '', suitType: '', handloomType: '', width: '', length: '' };
    });
  };

  const openModal = async (product?: typeof products[0]) => {
    if (product) {
      try {
        const fullProduct: any = await (db as any).getById('products', product.id || product._id);
        if (fullProduct) {
          setEditingProduct(fullProduct);
          setFormData({
            name: fullProduct.name, price: fullProduct.price.toString(), offerPercentage: fullProduct.offerPercentage?.toString() || '0',
            images: fullProduct.images.join(', '), category: fullProduct.category, subCategory: fullProduct.subCategory,
            description: fullProduct.description || '', sku: fullProduct.sku, quantity: fullProduct.quantity.toString(),
            width: fullProduct.width?.toString() || '', unit: fullProduct.unit || 'meters',
            productType: fullProduct.productType || (fullProduct.unit === 'pieces' ? 'saree' : 'fabric'),
            fabricType: fullProduct.fabricType || '', sareeType: fullProduct.sareeType || '', suitType: (fullProduct as any).suitType || '', handloomType: (fullProduct as any).handloomType || '',
            careInstructions: fullProduct.careInstructions || '', colors: fullProduct.colors?.join(', ') || '',
            features: fullProduct.features?.join(', ') || ''
          });
        } else {
          setEditingProduct(product);
          setFormData({
            name: product.name, price: product.price.toString(), offerPercentage: product.offerPercentage?.toString() || '0',
            images: product.images.join(', '), category: product.category, subCategory: product.subCategory,
            description: product.description || '', sku: product.sku, quantity: product.quantity.toString(),
            width: product.width?.toString() || '', unit: product.unit || 'meters',
            productType: product.productType || (product.unit === 'pieces' ? 'saree' : 'fabric'),
            fabricType: product.fabricType || '', sareeType: product.sareeType || '',
            careInstructions: product.careInstructions || '', colors: product.colors?.join(', ') || '',
            features: product.features?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setEditingProduct(product);
        setFormData({
          name: product.name, price: product.price.toString(), offerPercentage: product.offerPercentage?.toString() || '0',
          images: product.images.join(', '), category: product.category, subCategory: product.subCategory,
          description: product.description || '', sku: product.sku,
          productType: product.productType || (product.unit === 'pieces' ? 'saree' : 'fabric'),
          sareeType: product.sareeType || '', suitType: (product as any).suitType || '', handloomType: (product as any).handloomType || '',
          fabricType: product.fabricType || '', careInstructions: product.careInstructions || '',
          colors: product.colors?.join(', ') || '', features: product.features?.join(', ') || ''
        });
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) { alert('Please fill in all required fields: Name, Price, and Category'); return; }
    if (!formData.sku) { alert('SKU is required'); return; }
    if (!formData.quantity) { alert('Quantity is required'); return; }
    const productData = {
      name: formData.name, price: parseFloat(formData.price), offerPercentage: parseFloat(formData.offerPercentage) || 0,
      quantity: parseInt(formData.quantity),
      width: parseFloat(formData.width) || 0,
      length: isPieceType(formData.productType) ? parseFloat(formData.length) || 0 : 0,
      unit: formData.unit || 'meters', category: formData.category, subCategory: formData.subCategory,
      productType: formData.productType,
      fabricType: formData.productType === 'fabric' ? formData.fabricType : '',
      sareeType: formData.productType === 'saree' ? formData.sareeType : '',
      suitType: formData.productType === 'unstitched-suit-sets' ? formData.suitType : '',
      handloomType: formData.productType === 'handloom' ? formData.handloomType : '',
      careInstructions: formData.careInstructions, description: formData.description, sku: formData.sku,
      images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
    };
    try {
      if (editingProduct) { await updateProduct(editingProduct.id, productData); alert('Product updated successfully!'); }
      else { await createProduct(productData); alert('Product created successfully!'); }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) deleteProductDB(id);
  };

  const openAddModal = (productType: 'fabric' | 'saree' | 'unstitched-suit-sets' | 'handloom') => {
    resetForm();
    const isPieceType = productType === 'saree' || productType === 'unstitched-suit-sets' || productType === 'handloom';
    setFormData(prev => ({ ...prev, productType, unit: isPieceType ? 'pieces' : 'meters' }));
    setIsModalOpen(true);
    setIsAddProductDropdownOpen(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedCategory = categories.find(c => (c.id || c._id) === formData.category);
  const calculateDiscountedPrice = (price: number, offerPercentage: number) => price - (price * offerPercentage / 100);
  const getImagePreviews = () => formData.images.split(',').map(img => img.trim()).filter(Boolean).filter((img, idx, arr) => arr.indexOf(img) === idx);

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2" style={{ color: '#191c1e' }}>Products</h1>
          <p className="text-xs sm:text-sm md:text-base" style={{ color: '#76777d' }}>{products.length} total products</p>
        </div>
        <div className="relative">
          <button onClick={() => setIsAddProductDropdownOpen(!isAddProductDropdownOpen)}
            className="w-full sm:w-auto text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: '#0057c2' }}>
            <Plus size={18} className="sm:w-5 sm:h-5" /><span>Add Product</span>
            <ChevronDown size={16} className="sm:w-4 sm:h-4" />
          </button>
          {isAddProductDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsAddProductDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-sm border border-gray-100 z-50 overflow-hidden">
                <button onClick={() => openAddModal('fabric')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2" style={{ color: '#45464c' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0057c2' }}></span>Add Fabric</button>
                <button onClick={() => openAddModal('saree')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100" style={{ color: '#45464c' }}>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>Add Saree</button>
                <button onClick={() => openAddModal('unstitched-suit-sets')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100" style={{ color: '#45464c' }}>
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>Add Unstitched Suit Sets</button>
                <button onClick={() => openAddModal('handloom')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100" style={{ color: '#45464c' }}>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>Add Handloom</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" style={{ color: '#76777d' }} size={18} />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredProducts.map((product) => {
          const discountedPrice = calculateDiscountedPrice(product.price, product.offerPercentage);
          return (
            <div key={product.id || product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square relative" style={{ backgroundColor: '#f7f9fb' }}>
                <img src={convertGoogleDriveLink(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                {(() => {
                  const typeConfig: Record<string, { label: string; textColor: string; bgColor: string }> = {
                    'fabric': { label: 'Fabric', textColor: 'text-white', bgColor: '#0057c2' },
                    'saree': { label: 'Saree', textColor: 'text-purple-700', bgColor: '#ede9fe' },
                    'unstitched-suit-sets': { label: 'Unstitched Suit Sets', textColor: 'text-white', bgColor: '#d97706' },
                    'handloom': { label: 'Handloom', textColor: 'text-white', bgColor: '#059669' },
                  };
                  const cfg = typeConfig[product.productType || (product.unit === 'pieces' ? 'saree' : 'fabric')] || typeConfig['fabric'];
                  return (
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.textColor}`}
                      style={{ backgroundColor: cfg.bgColor }}>
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <div className="p-2 sm:p-3 md:p-6">
                <h3 className="text-xs sm:text-base md:text-lg font-semibold mb-1 line-clamp-2" style={{ color: '#191c1e' }}>{product.name}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-3 hidden sm:block" style={{ color: '#76777d' }}>SKU: {product.sku}</p>
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1 sm:mb-3">
                  <span className="text-sm sm:text-lg md:text-2xl font-bold" style={{ color: '#191c1e' }}>₹{discountedPrice.toFixed(2)}</span>
                  {product.offerPercentage > 0 && (
                    <>
                      <span className="text-[10px] sm:text-xs md:text-sm line-through hidden sm:inline" style={{ color: '#76777d' }}>₹{product.price}</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium hidden sm:inline" style={{ color: '#059669' }}>-{product.offerPercentage}%</span>
                    </>
                  )}
                </div>
                  <p className="text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-4 hidden sm:block" style={{ color: '#76777d' }}>
                   Stock: {product.unit === 'pieces' ? `${product.quantity} pieces` : `${product.quantity} meters`}
                   {product.width && product.width > 0 && product.unit !== 'pieces' && <> • Width: {Math.round(product.width * 39.3701)} in</>}
                 </p>
                <div className="flex gap-1 sm:gap-2">
                  <button onClick={() => openModal(product)}
                    className="flex-1 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm"
                    style={{ border: '2px solid #0057c2', color: '#0057c2' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0057c2'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0057c2'; }}>
                    <Edit size={14} className="sm:w-4 sm:h-4" /><span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(product.id || product._id)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ border: '2px solid #ef4444', color: '#ef4444' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-[990]" style={{ backgroundColor: 'rgba(20,27,43,0.5)' }} onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-[999]"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#191c1e' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} style={{ color: '#76777d' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Product Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>SKU *</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Product Type</label>
                  <select value={formData.productType} onChange={handleProductTypeChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]">
                    <option value="fabric">Fabric</option>
                    <option value="saree">Saree</option>
                    <option value="unstitched-suit-sets">Unstitched Suit Sets</option>
                    <option value="handloom">Handloom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Price (₹) *</label>
                  <input type="number" required step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Offer Percentage (%)</label>
                  <input type="number" min="0" max="100" value={formData.offerPercentage} onChange={(e) => setFormData(prev => ({ ...prev, offerPercentage: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Quantity *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" required min="0" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="Qty" />
                    <select value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]">
                      <option value="meters">meters</option><option value="pieces">pieces</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Width (inches)</label>
                  <input type="number" step="0.01" min="0" value={formData.width} onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., 1.5" />
                </div>
                {isPieceType(formData.productType) && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Length (meters)</label>
                    <input type="number" step="0.01" min="0" value={formData.length} onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., 6.5" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]">
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.isActive).map(cat => <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Sub Category</label>
                  <select value={formData.subCategory} onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))} disabled={!formData.category}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2] disabled:opacity-50">
                    <option value="">Select Sub Category</option>
                    {selectedCategory?.subCategories.map(sub => <option key={sub.slug} value={sub.slug}>{sub.name}</option>)}
                  </select>
                </div>
                {formData.productType === 'fabric' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Fabric Type</label>
                    <input type="text" value={formData.fabricType} onChange={(e) => setFormData(prev => ({ ...prev, fabricType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., Cotton, Silk, Linen" />
                  </div>
                ) : formData.productType === 'saree' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Saree Type</label>
                    <input type="text" value={formData.sareeType} onChange={(e) => setFormData(prev => ({ ...prev, sareeType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., Silk, Cotton, Georgette" />
                  </div>
                ) : formData.productType === 'unstitched-suit-sets' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Suit Type</label>
                    <input type="text" value={formData.suitType} onChange={(e) => setFormData(prev => ({ ...prev, suitType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., Salwar Suit, Anarkali, Lehenga" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Handloom Type</label>
                    <input type="text" value={formData.handloomType} onChange={(e) => setFormData(prev => ({ ...prev, handloomType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., Banarasi, Kanjeevaram, Pochampally" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Care Instructions</label>
                  <input type="text" value={formData.careInstructions} onChange={(e) => setFormData(prev => ({ ...prev, careInstructions: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="e.g., Dry clean only. Iron on low heat." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Product Images * (Auto-resized to 1080x1080)</label>
                  <div className="mb-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50" style={{ borderColor: '#d1d5db' }}>
                      <Upload size={20} style={{ color: '#76777d' }} />
                      <span style={{ color: '#45464c' }}>{uploadingImages ? 'Processing...' : 'Upload Images'}</span>
                      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
                    </label>
                    <p className="text-xs mt-2" style={{ color: '#76777d' }}>All images will be automatically cropped and resized to 1080x1080 pixels (square)</p>
                  </div>
                  <div className="mb-4">
                    <button type="button" onClick={() => setShowGoogleDrivePicker(!showGoogleDrivePicker)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-all font-medium hover:border-blue-400 hover:bg-blue-50"
                      style={{ borderColor: '#93c5fd', color: '#0057c2' }}>
                      <ImageIcon size={20} />{showGoogleDrivePicker ? 'Hide Google Drive' : 'Add from Google Drive'}
                    </button>
                  </div>
                  {showGoogleDrivePicker && (
                    <div className="mb-4"><GoogleDrivePicker onSelect={handleGoogleDriveImages} multiple={true} disabled={uploadingImages} /></div>
                  )}
                  {getImagePreviews().length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {getImagePreviews().map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200" style={{ backgroundColor: '#f7f9fb' }}>
                          <img src={convertGoogleDriveLink(img)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const images = getImagePreviews(); images.splice(index, 1); setFormData(prev => ({ ...prev, images: images.join(', ') })); }}
                            className="absolute top-1 right-1 text-white rounded-full p-1 hover:opacity-90 transition-all" style={{ backgroundColor: '#ef4444' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: '#76777d' }}>Or add image URLs manually (comma-separated)</label>
                    <input type="text" value={formData.images} onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2] text-sm"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg, or Google Drive links" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Colors (comma-separated)</label>
                  <input type="text" value={formData.colors} onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" placeholder="red, blue, green, natural" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>
                    Features (comma-separated)
                    <span className="text-xs ml-2" style={{ color: '#76777d' }}>Add product highlights and key features</span>
                  </label>
                  <textarea rows={3} value={formData.features} onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]"
                    placeholder="100% Pure Silk, Natural Sheen, Highly Breathable, Hypoallergenic, Easy Care" />
                  <p className="text-xs mt-1" style={{ color: '#76777d' }}>Tip: Each feature separated by comma will appear as a bullet point on the product page</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#45464c' }}>Description *</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057c2]" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 border-2 border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" disabled={uploadingImages}
                  className="flex-1 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0057c2' }}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
