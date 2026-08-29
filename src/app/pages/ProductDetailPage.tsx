import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Check, Truck, Shield, RotateCcw, ChevronRight, Home, Store, Star } from 'lucide-react';
import { supabase } from '../services/database-supabase';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import RatingComponent from '../components/RatingComponent';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  offerPercentage: number;
  quantity: number;
  category: string;
  subCategory: string;
  fabricType: string;
  sareeType: string;
  careInstructions: string;
  description: string;
  images: string[];
  colors: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  width: number;
  unit: string;
}

const COLORS = {
  blue: '#0057c2',
  dark: '#141b2b',
  light: '#f7f9fb',
  text: '#191c1e',
  secondary: '#45464c',
  muted: '#76777d',
  border: '#e5e7eb',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, categories } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      const normalizedData = { ...data } as Record<string, unknown>;
      if (normalizedData.images && typeof normalizedData.images === 'string') {
        normalizedData.images = normalizedData.images.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      // Convert snake_case to camelCase (same as db.transformRow)
      const camelData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(normalizedData)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelData[camelKey] = value;
      }
      setProduct(camelData as Product);

      const isFabric = data.productType === 'fabric' || (!data.productType && data.unit !== 'pieces');
      const minQty = isFabric ? 2 : 1;
      setQuantity(minQty);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const isInWishlist = product ? wishlist.includes(product.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.light }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-3 rounded-full animate-spin"
            style={{
              borderColor: COLORS.border,
              borderTopColor: COLORS.blue,
            }}
          />
          <p className="text-sm" style={{ color: COLORS.muted }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.light }}>
        <div className="text-center px-4">
          <p className="text-xl font-semibold mb-2" style={{ color: COLORS.text }}>
            {error || 'Product not found'}
          </p>
          <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.blue }}
          >
            <Store size={16} />
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.offerPercentage > 0
    ? product.price - (product.price * product.offerPercentage / 100)
    : product.price;

  const widthDisplay = product.width && product.width > 0
    ? `${product.width}"`
    : null;

  const stockStatus =
    product.quantity === 0
      ? { label: 'Out of Stock', color: '#dc2626', available: false }
      : product.quantity < 5
        ? { label: 'Low Stock', color: '#f59e0b', available: true }
        : {
            label: `In Stock (${product.quantity} ${product.unit === 'pieces' ? 'pieces' : 'meters'} available)`,
            color: '#16a34a',
            available: true,
          };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.light }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-4 md:py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-6 md:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: COLORS.muted }}
          >
            <Home size={14} />
            <span className="hidden sm:inline">Home</span>
          </button>
          <ChevronRight size={14} style={{ color: COLORS.muted }} />
          <button
            onClick={() => navigate('/shop')}
            className="hover:opacity-70 transition-opacity"
            style={{ color: COLORS.muted }}
          >
            Shop
          </button>
          <ChevronRight size={14} style={{ color: COLORS.muted }} />
          <span className="font-medium truncate max-w-[200px]" style={{ color: COLORS.text }}>
            {product.name}
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          {/* Product Gallery */}
          <div>
            <div
              className="rounded-2xl overflow-hidden bg-white"
              style={{ aspectRatio: '4/3' }}
            >
              <img
                src={convertGoogleDriveLink(product.images?.[selectedImage] || '')}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-size="16"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="rounded-xl overflow-hidden transition-all"
                    style={{
                      border: selectedImage === index
                        ? `2px solid ${COLORS.blue}`
                        : '2px solid transparent',
                      opacity: selectedImage === index ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={convertGoogleDriveLink(img)}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category Badge */}
            <span
              className="inline-block text-white text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: COLORS.blue }}
            >
              {categories.find(c => c.slug === product.category || c.id === product.category)?.name || product.category}
            </span>

            {/* Product Name */}
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ color: COLORS.text }}
            >
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: COLORS.text }}>
                ₹{discountedPrice.toFixed(2)}
              </span>
              {product.offerPercentage > 0 && (
                <>
                  <span
                    className="text-lg line-through"
                    style={{ color: COLORS.muted }}
                  >
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span
                    className="text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    {product.offerPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stockStatus.color }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: stockStatus.color }}
              >
                {stockStatus.label}
              </span>
            </div>

            {/* Info Grid */}
              <div
                className="grid grid-cols-2 gap-3 p-4 rounded-xl"
                style={{ backgroundColor: COLORS.light }}
              >
                {product.productType === 'fabric' && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                      Fabric Type
                    </p>
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {product.fabricType || 'N/A'}
                    </p>
                  </div>
                )}
                {product.productType === 'saree' && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                      Saree Type
                    </p>
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {product.sareeType || 'N/A'}
                    </p>
                  </div>
                )}
                {product.productType === 'unstitched-suit-sets' && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                      Suit Type
                    </p>
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {product.suitType || 'N/A'}
                    </p>
                  </div>
                )}
                {product.productType === 'handloom' && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                      Handloom Type
                    </p>
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {product.handloomType || 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                    Width
                  </p>
                  <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {widthDisplay || 'N/A'}
                  </p>
                </div>
                {product.productType !== 'fabric' && product.length > 0 && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                      Length
                    </p>
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {product.length} meters
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                    Unit
                  </p>
                  <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {product.unit === 'pieces' ? 'Per Piece' : 'Per Meter'}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: COLORS.muted }}>
                    SKU
                  </p>
                  <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {product.sku}
                  </p>
                </div>
              </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: COLORS.light }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: COLORS.muted }}>
                  Care Instructions
                </p>
                <p className="text-sm" style={{ color: COLORS.text }}>
                  {product.careInstructions}
                </p>
              </div>
            )}

            {/* Color Options */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                  Available Colors
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((colorName, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{
                        borderColor: COLORS.border,
                        color: COLORS.text,
                        backgroundColor: '#fff',
                      }}
                    >
                      {colorName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.quantity > 0 && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: COLORS.text }}
                >
                  {product.productType === 'fabric' ? 'Quantity (in meters)' : 'Quantity'}
                </label>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => {
                       const isFabric = product.productType === 'fabric' || (!product.productType && product.unit !== 'pieces');
                       setQuantity(Math.max(isFabric ? 2 : 1, quantity - 1));
                    }}
                    className="w-10 h-10 flex items-center justify-center border rounded-l-xl text-lg font-medium transition-colors hover:bg-gray-100"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  >
                    -
                  </button>
                  <span
                    className="w-14 h-10 flex items-center justify-center border-t border-b text-base font-medium"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                      backgroundColor: '#fff',
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(100, Math.min(product.quantity, quantity + 1)))
                    }
                    className="w-10 h-10 flex items-center justify-center border rounded-r-xl text-lg font-medium transition-colors hover:bg-gray-100"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  >
                    +
                  </button>
                </div>
                {product.unit !== 'pieces' && (
                  <p className="text-xs mt-2" style={{ color: COLORS.muted }}>
                    Minimum order: 2 meters
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 px-8 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.blue }}
              >
                {addedToCart ? (
                  <>
                    <Check size={18} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 px-8 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.dark }}
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all hover:bg-gray-50"
                style={{
                  borderColor: isInWishlist ? '#dc2626' : COLORS.border,
                  backgroundColor: isInWishlist ? '#dc2626' : 'transparent',
                  color: isInWishlist ? '#fff' : COLORS.text,
                }}
              >
                <Heart
                  size={18}
                  className={isInWishlist ? 'fill-white text-white' : ''}
                />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="pt-5"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
              >
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: COLORS.text }}
                >
                  Description
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.secondary }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div
                className="pt-5"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
              >
                <h3
                  className="text-base font-semibold mb-3"
                  style={{ color: COLORS.text }}
                >
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: COLORS.text }}
                    >
                      <Check
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: COLORS.blue }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-14 p-6 rounded-2xl"
          style={{ backgroundColor: '#fff' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.blue}10` }}
            >
              <Truck size={20} style={{ color: COLORS.blue }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Free Shipping
              </p>
              <p className="text-xs" style={{ color: COLORS.muted }}>
                 On orders above ₹1999
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.blue}10` }}
            >
              <Shield size={20} style={{ color: COLORS.blue }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                100% Authentic
              </p>
              <p className="text-xs" style={{ color: COLORS.muted }}>
                Quality guaranteed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.blue}10` }}
            >
              <RotateCcw size={20} style={{ color: COLORS.blue }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Easy Returns
              </p>
              <p className="text-xs" style={{ color: COLORS.muted }}>
                7-day return policy
              </p>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-10 md:mt-14">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: COLORS.text }}
          >
            Customer Reviews
          </h2>
          <RatingComponent
            productId={product.id}
            productName={product.name}
            userId={localStorage.getItem('userId') || (localStorage.getItem('userEmail') ? `user_${localStorage.getItem('userEmail')!.toLowerCase()}` : undefined)}
            userName={localStorage.getItem('userName') || (localStorage.getItem('userEmail') ? localStorage.getItem('userEmail')!.split('@')[0] : undefined)}
            userEmail={localStorage.getItem('userEmail') || undefined}
          />
        </div>
      </div>
    </div>
  );
}
