import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product as DBProduct, Order, Coupon, Banner, Category, db, getDatabaseStatus } from '../services/database-supabase';

export interface Product extends DBProduct {
  id: string; // Alias for _id for compatibility
}

export interface CartItem extends Product {
  cartQuantity: number;
}

interface AppContextType {
  // Cart & Wishlist
  cartItems: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;

  // Database State (loaded on page refresh, no polling)
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  categories: Category[];
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCoupons: () => Promise<void>;
  refreshBanners: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Order Management
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;

  // Product Management
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Coupon Management
  createCoupon: (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => Promise<Coupon>;
  updateCoupon: (couponId: string, couponData: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  validateCoupon: (code: string, orderValue: number) => { valid: boolean; coupon?: Coupon; error?: string };

  // Banner Management
  createBanner: (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Banner>;
  updateBanner: (bannerId: string, bannerData: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;

  // Category Management
  createCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart and wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Database state - loaded on page refresh
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load data from Supabase on page load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories and banners first (usually smaller)
        const [loadedBanners, loadedCategories, loadedCoupons] = await Promise.all([
          db.getAll<Banner>('banners'),
          db.getAll<Category>('categories'),
          db.getAll<Coupon>('coupons'),
        ]);

        setBanners(loadedBanners);
        setCategories(loadedCategories);
        setCoupons(loadedCoupons);

        // Load products with pagination
        const productsResult = await db.getPaginated<DBProduct>('products', {
          page: 1,
          limit: 50,
        });

        const loadedProducts = productsResult.data.map(p => {
          const normalized = { ...p, id: p.id };
          if (normalized.images && typeof normalized.images === 'string') {
            normalized.images = normalized.images.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          return normalized;
        });
        setProducts(loadedProducts);

        // Load orders
        const loadedOrders = await db.getAll<Order>('orders');
        setOrders(loadedOrders);

        console.log('Data loaded from Supabase');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Helpers
  const getMinOrderQuantity = (product: Product): number => {
    const isFabric = product.productType === 'fabric' || (!product.productType && product.unit !== 'pieces');
    return isFabric ? 2 : 1;
  };

  // Cart Management
  const addToCart = (product: Product, quantity?: number) => {
    const minQty = getMinOrderQuantity(product);
    const quantityToAdd = Math.max(minQty, Math.min(quantity || minQty, 100));

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: Math.min(item.cartQuantity + quantityToAdd, 100) }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: quantityToAdd }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const validatedQuantity = Math.min(parseInt(String(quantity), 10) || 1, 100);
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const minQty = getMinOrderQuantity(item);
        const finalQty = Math.max(minQty, validatedQuantity);
        return { ...item, cartQuantity: finalQty };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Refresh functions (manual data reload)
  const refreshProducts = async () => {
    try {
      const result = await db.getPaginated<DBProduct>('products', { page: 1, limit: 50 });
      const data = result.data.map(p => ({ ...p, id: p.id }));
      setProducts(data);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  const refreshOrders = async () => {
    try {
      const data = await db.getAll<Order>('orders');
      setOrders(data);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  const refreshCoupons = async () => {
    try {
      const data = await db.getAll<Coupon>('coupons');
      setCoupons(data);
    } catch (error) {
      console.error('Error refreshing coupons:', error);
    }
  };

  const refreshBanners = async () => {
    try {
      const data = await db.getAll<Banner>('banners');
      setBanners(data);
    } catch (error) {
      console.error('Error refreshing banners:', error);
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await db.getAll<Category>('categories');
      setCategories(data);
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  const refreshAllData = async () => {
    try {
      await Promise.all([
        refreshProducts(),
        refreshOrders(),
        refreshCoupons(),
        refreshBanners(),
        refreshCategories(),
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
    }
  };

  // Order Management
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const order = await db.create<Order>('orders', {
      ...orderData,
      orderNumber,
      status: orderData.status || 'pending',
      paymentStatus: orderData.paymentStatus || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Order);
    setOrders(prev => [...prev, order]);
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    console.log('[updateOrderStatus] id:', orderId, 'status:', status);
    const updated = await db.update<Order>('orders', orderId, { status });
    console.log('[updateOrderStatus] result:', updated);
    if (!updated) {
      throw new Error('Order status update failed — check Supabase RLS policies or console for errors');
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Product Management
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const product = await db.create<DBProduct>('products', {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DBProduct);
    const newProduct = { ...product, id: product.id } as Product;
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    const { id, ...dataWithoutId } = productData;
    console.log('[updateProduct] id:', productId, 'data:', dataWithoutId);
    const updated = await db.update<DBProduct>('products', productId, dataWithoutId);
    console.log('[updateProduct] result:', updated);
    if (!updated) {
      throw new Error('Update returned no result — check Supabase RLS policies or console for errors');
    }
    const updatedProduct = { ...updated, id: updated.id } as Product;
    setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
  };

  const deleteProduct = async (productId: string) => {
    await db.delete('products', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Coupon Management
  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Coupon> => {
    const result = await db.create<Coupon>('coupons', {
      ...couponData,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Coupon);
    setCoupons(prev => [result, ...prev]);
    return result;
  };

  const updateCoupon = async (couponId: string, couponData: Partial<Coupon>) => {
    const updated = await db.update<Coupon>('coupons', couponId, couponData);
    if (updated) {
      setCoupons(prev => prev.map(c => c.id === couponId ? updated : c));
    }
  };

  const deleteCoupon = async (couponId: string) => {
    await db.delete('coupons', couponId);
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  const validateCoupon = (code: string, orderValue: number) => {
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Coupon is not active' };
    }

    if (new Date(coupon.validFrom) > new Date()) {
      return { valid: false, error: 'Coupon is not yet valid' };
    }

    if (new Date(coupon.validTo) < new Date()) {
      return { valid: false, error: 'Coupon has expired' };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    if (orderValue < coupon.minOrderValue) {
      return { valid: false, error: `Minimum order value of ₹${coupon.minOrderValue} required` };
    }

    return { valid: true, coupon };
  };

  // Banner Management
  const createBanner = async (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banner> => {
    const result = await db.create<Banner>('banners', {
      ...bannerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Banner);
    setBanners(prev => [result, ...prev]);
    return result;
  };

  const updateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
    const updated = await db.update<Banner>('banners', bannerId, bannerData);
    if (updated) {
      setBanners(prev => prev.map(b => b.id === bannerId ? updated : b));
    }
  };

  const deleteBanner = async (bannerId: string) => {
    await db.delete('banners', bannerId);
    setBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  // Category Management
  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const result = await db.create<Category>('categories', {
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Category);
    setCategories(prev => [result, ...prev]);
    return result;
  };

  const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
    const updated = await db.update<Category>('categories', categoryId, categoryData);
    if (updated) {
      setCategories(prev => prev.map(c => c.id === categoryId ? updated : c));
    }
  };

  const deleteCategory = async (categoryId: string) => {
    await db.delete('categories', categoryId);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleWishlist,
        clearCart,
        products,
        orders,
        coupons,
        banners,
        categories,
        refreshProducts,
        refreshOrders,
        refreshCoupons,
        refreshBanners,
        refreshCategories,
        refreshAllData,
        createOrder,
        updateOrderStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        createBanner,
        updateBanner,
        deleteBanner,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.warn('useApp called outside AppProvider - returning mock data for preview');
    return {
      cartItems: [],
      wishlist: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      toggleWishlist: () => {},
      clearCart: () => {},
      products: [],
      orders: [],
      coupons: [],
      banners: [],
      categories: [],
      refreshProducts: async () => {},
      refreshOrders: async () => {},
      refreshCoupons: async () => {},
      refreshBanners: async () => {},
      refreshCategories: async () => {},
      refreshAllData: async () => {},
      createOrder: async () => ({ id: '', orderNumber: '', customerName: '', customerEmail: '', customerPhone: '', shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' }, items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, status: 'pending', paymentStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateOrderStatus: async () => {},
      createProduct: async () => ({ id: '', sku: '', name: '', price: 0, offerPercentage: 0, quantity: 0, category: '', subCategory: '', fabricType: '', careInstructions: '', description: '', images: [], colors: [], features: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateProduct: async () => {},
      deleteProduct: async () => {},
      createCoupon: async () => ({ id: '', code: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, validFrom: new Date().toISOString(), validTo: new Date().toISOString(), usageLimit: 0, usedCount: 0, isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateCoupon: async () => {},
      deleteCoupon: async () => {},
      validateCoupon: () => ({ valid: false, error: 'Preview mode' }),
      createBanner: async () => ({ id: '', type: 'hero-main', title: '', image: '', link: '', isActive: false, order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateBanner: async () => {},
      deleteBanner: async () => {},
      createCategory: async () => ({ id: '', name: '', slug: '', subCategories: [], isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      updateCategory: async () => {},
      deleteCategory: async () => {},
    } as AppContextType;
  }
  return context;
}
