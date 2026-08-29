import { useState, useEffect, useMemo } from 'react';
import { supabase, Category } from '../services/database-supabase';
import { convertGoogleDriveLink } from '../../lib/googleDriveUtils';
import { Search, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { config } from '../config/env';

interface Product {
  id: string;
  _id?: string;
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

const DESIGN = {
  blue: '#0057c2',
  darkBg: '#141b2b',
  lightBg: '#f7f9fb',
  text: '#191c1e',
  secondary: '#45464c',
  muted: '#76777d',
  white: '#ffffff',
  border: '#e5e7eb',
  redBadge: '#ef4444',
} as const;

import { useParams, useNavigate, Link } from 'react-router';
export default function ShopPage() {
  const params = useParams<{ category?: string; subCategory?: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || '');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] =
          await Promise.all([
            supabase.from('products').select('*'),
            supabase.from('categories').select('*'),
          ]);

        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else if (productsData) {
          const mapped = (productsData as Record<string, unknown>[]).map((p) => {
            const normalized = { ...p, id: (p.id as string) || (p._id as string) };
            if (normalized.images && typeof normalized.images === 'string') {
              normalized.images = normalized.images.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            return normalized;
          }) as unknown as Product[];
          setProducts(mapped);
        }

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else if (categoriesData) {
          setCategories(categoriesData as Category[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Product type definitions
  const PRODUCT_TYPES = [
    { value: 'fabric', label: 'Fabric' },
    { value: 'saree', label: 'Saree' },
    { value: 'unstitched-suit-sets', label: 'Unstitched Suit Sets' },
    { value: 'handloom', label: 'Handloom' },
  ];

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const effectiveType = product.productType || (product.unit === 'pieces' ? 'saree' : 'fabric');

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          (product.fabricType || '').toLowerCase().includes(query) ||
          (product.sareeType || '').toLowerCase().includes(query) ||
          (product.suitType || '').toLowerCase().includes(query) ||
          (product.handloomType || '').toLowerCase().includes(query) ||
          (product.category || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      // Product type filter
      if (selectedProductType && effectiveType !== selectedProductType) {
        return false;
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedProductType, priceRange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedProductType('');
    setPriceRange([0, 50000]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedProductType || priceRange[0] > 0 || priceRange[1] < 50000;

  // Skeleton card component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: DESIGN.border }}>
      <div className="aspect-video bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: DESIGN.lightBg }}>
      {/* Top Header Section */}
      <div className="border-b" style={{ backgroundColor: DESIGN.white, borderColor: DESIGN.border }}>
        <div className="max-w-[1440px] mx-auto px-16 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: DESIGN.muted }}>
            <span>Home</span>
            <ChevronRight size={14} />
              <span style={{ color: DESIGN.text }}>{selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Shop' : 'Shop All'}</span>
          </nav>

          {/* Title and Result Count */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1
                className="text-3xl md:text-4xl font-semibold tracking-tight"
                style={{ color: DESIGN.text, fontFamily: 'Inter, sans-serif' }}
              >
                {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Shop' : 'Shop All'}
              </h1>
              <p className="mt-1 text-sm" style={{ color: DESIGN.muted }}>
                {isLoading
                  ? 'Loading...'
                  : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{
                borderColor: DESIGN.border,
                color: DESIGN.text,
                backgroundColor: DESIGN.white,
              }}
            >
              <SlidersHorizontal size={16} />
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-6">
        <div className="relative max-w-2xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: DESIGN.muted }}
          />
          <input
            type="text"
            placeholder="Search products by name, type, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-full border text-sm outline-none transition-all focus:ring-2"
            style={{
              borderColor: DESIGN.border,
              backgroundColor: DESIGN.white,
              color: DESIGN.text,
              fontFamily: 'Inter, sans-serif',
              '--tw-ring-color': DESIGN.blue,
            } as React.CSSProperties}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={16} style={{ color: DESIGN.muted }} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 pb-16">
        <div className="flex gap-8">
          {/* Left Sidebar - 3/12 width */}
          <aside
            className={`w-full lg:w-[25%] shrink-0 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}
          >
            <div className="sticky top-6 space-y-6">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: DESIGN.lightBg,
                    color: DESIGN.text,
                    border: `1px solid ${DESIGN.border}`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Clear All Filters
                </button>
              )}

              {/* Categories */}
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: DESIGN.white, borderColor: DESIGN.border }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: DESIGN.secondary, fontFamily: 'Inter, sans-serif' }}
                >
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedCategory(''); navigate('/shop'); }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: !selectedCategory ? DESIGN.text : DESIGN.lightBg,
                      color: !selectedCategory ? DESIGN.white : DESIGN.text,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    All Products
                  </button>
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); navigate(`/shop/${cat.slug}`); }}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                          backgroundColor: selectedCategory === cat.slug ? DESIGN.text : DESIGN.lightBg,
                          color: selectedCategory === cat.slug ? DESIGN.white : DESIGN.text,
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Price Range */}
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: DESIGN.white, borderColor: DESIGN.border }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: DESIGN.secondary, fontFamily: 'Inter, sans-serif' }}
                >
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ''}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{
                        borderColor: DESIGN.border,
                        color: DESIGN.text,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                    <span style={{ color: DESIGN.muted }}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] || ''}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value) || 50000])
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{
                        borderColor: DESIGN.border,
                        color: DESIGN.text,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                  {/* Visual slider track */}
                  <div
                    className="relative h-2 rounded-full"
                    style={{ backgroundColor: DESIGN.lightBg }}
                  >
                    <div
                      className="absolute h-2 rounded-full"
                      style={{
                        backgroundColor: DESIGN.blue,
                        left: `${(priceRange[0] / 50000) * 100}%`,
                        right: `${100 - (priceRange[1] / 50000) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: DESIGN.muted }}>
                    <span>{config.currency.symbol}0</span>
                    <span>{config.currency.symbol}50,000</span>
                  </div>
                </div>
              </div>

              {/* Product Type */}
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: DESIGN.white, borderColor: DESIGN.border }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: DESIGN.secondary, fontFamily: 'Inter, sans-serif' }}
                >
                  Product Type
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedProductType('')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: !selectedProductType ? DESIGN.text : DESIGN.lightBg,
                      color: !selectedProductType ? DESIGN.white : DESIGN.text,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    All Products
                  </button>
                  {PRODUCT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedProductType(type.value)}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedProductType === type.value ? DESIGN.text : DESIGN.lightBg,
                        color: selectedProductType === type.value ? DESIGN.white : DESIGN.text,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid - 9/12 width */}
          <main className="flex-1">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div
                className="flex flex-col items-center justify-center py-24 rounded-xl border"
                style={{
                  backgroundColor: DESIGN.white,
                  borderColor: DESIGN.border,
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: DESIGN.lightBg }}
                >
                  <Search size={32} style={{ color: DESIGN.muted }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: DESIGN.text, fontFamily: 'Inter, sans-serif' }}
                >
                  No products found
                </h3>
                <p className="text-sm mb-6 text-center max-w-sm" style={{ color: DESIGN.muted }}>
                  We couldn't find any fabrics matching your criteria. Try adjusting your filters or search terms.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: DESIGN.blue, fontFamily: 'Inter, sans-serif' }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price as string) || 0;
                  const offerPercentage = typeof product.offerPercentage === 'number' ? product.offerPercentage : parseFloat(product.offerPercentage as string) || 0;
                  const discountedPrice = price - (price * offerPercentage) / 100;

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group block bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{
                        borderColor: DESIGN.border,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      {/* Image Section */}
                      <div className="relative aspect-video overflow-hidden cursor-pointer" style={{ backgroundColor: DESIGN.lightBg }}>
                        <img
                          src={convertGoogleDriveLink(product.images?.[0] || '')}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />

                        {/* Category Badge */}
                        <span
                          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: DESIGN.blue }}
                        >
                          {categories.find(c => c.slug === product.category || c.id === product.category)?.name || product.category}
                        </span>

                        {/* Offer Badge */}
                        {product.offerPercentage > 0 && (
                          <span
                            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: DESIGN.redBadge }}
                          >
                            -{product.offerPercentage}%
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3
                          className="text-sm font-semibold mb-1 line-clamp-1"
                          style={{ color: DESIGN.text, fontFamily: 'Inter, sans-serif' }}
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs mb-3" style={{ color: DESIGN.muted, fontFamily: 'Inter, sans-serif' }}>
                          {product.productType === 'fabric'
                            ? `${product.quantity} meters available`
                            : `${product.quantity} pieces available`}
                        </p>

                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-base font-bold"
                            style={{ color: DESIGN.text, fontFamily: 'Inter, sans-serif' }}
                          >
                            {config.currency.symbol}{discountedPrice.toFixed(2)}
                          </span>
                          {product.offerPercentage > 0 && (
                            <span
                              className="text-xs line-through"
                              style={{ color: DESIGN.muted, fontFamily: 'Inter, sans-serif' }}
                            >
                              {config.currency.symbol}{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                  </Link>);
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

