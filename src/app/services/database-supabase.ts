// Supabase Database Service
// Replaces MongoDB API with direct Supabase client calls
// No polling - data loads on page refresh

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types (re-exported from database.ts)
export type Product = {
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
  suitType: string;
  handloomType: string;
  length: number;
  careInstructions: string;
  description: string;
  images: string[];
  colors: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  width: number;
  unit: string;
  productType: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    price: number;
    originalPrice: number;
    offerPercentage: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Banner = {
  id: string;
  type: 'hero-main' | 'hero-side' | 'casual-inspiration';
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  subCategories: {
    name: string;
    slug: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CollectionName = 'products' | 'orders' | 'coupons' | 'banners' | 'categories';

// Supabase Database Service
class SupabaseService {
  private tableMap: Record<CollectionName, string> = {
    products: 'products',
    orders: 'orders',
    coupons: 'coupons',
    banners: 'banners',
    categories: 'categories',
  };

  // Generic CRUD operations using Supabase
  async getAll<T>(collection: CollectionName): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableMap[collection])
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${collection}:`, error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => this.transformRow(row)) as T[];
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      return [];
    }
  }

  async getById<T>(collection: CollectionName, id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableMap[collection])
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return this.transformRow(data) as T;
    } catch (error) {
      console.error(`Error fetching ${collection}/${id}:`, error);
      return null;
    }
  }

  private toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      if (Array.isArray(value)) {
        result[snakeKey] = value.map(item =>
          typeof item === 'object' && item !== null
            ? this.toSnakeCase(item as Record<string, unknown>)
            : item
        );
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        result[snakeKey] = this.toSnakeCase(value as Record<string, unknown>);
      } else {
        result[snakeKey] = value;
      }
    }
    return result;
  }

  async create<T extends Record<string, unknown>>(collection: CollectionName, data: T): Promise<T & { id: string; createdAt: string; updatedAt: string }> {
    const now = new Date().toISOString();
    const row = {
      id: crypto.randomUUID(),
      ...this.toSnakeCase(data),
      created_at: now,
      updated_at: now,
    };

    const { data: result, error } = await supabase
      .from(this.tableMap[collection])
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${collection}:`, JSON.stringify(error, null, 2));
      console.error('Error details:', error.details, error.hint, error.code);
      throw new Error(error.message || 'Failed to create item');
    }

    return this.transformRow(result) as T & { id: string; createdAt: string; updatedAt: string };
  }

  async update<T extends { id: string }>(collection: CollectionName, id: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await supabase
      .from(this.tableMap[collection])
      .update({ ...this.toSnakeCase(data), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !result) {
      console.error(`Error updating ${collection}/${id}:`, error);
      return null;
    }

    return this.transformRow(result) as T;
  }

  async delete(collection: CollectionName, id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableMap[collection])
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${collection}/${id}:`, error);
      return false;
    }

    return true;
  }

  // Paginated query for products
  async getPaginated<T>(collection: CollectionName, params: {
    page?: number;
    limit?: number;
    category?: string;
    subCategory?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasMore: boolean;
    };
  }> {
    const pageNum = Math.max(1, params.page || 1);
    const limitNum = Math.max(1, Math.min(50, params.limit || 24));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    try {
      let query = supabase
        .from(this.tableMap[collection])
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.category && String(params.category).trim()) {
        query = query.eq('category', String(params.category).trim());
      }
      if (params.subCategory && String(params.subCategory).trim()) {
        query = query.eq('sub_category', String(params.subCategory).trim());
      }
      if (params.color && String(params.color).trim()) {
        query = query.eq('colors', String(params.color).trim(), false);
      }
      if (typeof params.minPrice === 'number' && !isNaN(params.minPrice) && params.minPrice > 0) {
        query = query.gte('price', params.minPrice);
      }
      if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice) && params.maxPrice > 0) {
        query = query.lte('price', params.maxPrice);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
      query = query.order(sortBy, sortOrder);

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(`Error fetching paginated ${collection}:`, error);
        return { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0, hasMore: false } };
      }

      const total = count || 0;
      const pages = Math.ceil(total / limitNum);

      return {
        data: (data || []).map((row: Record<string, unknown>) => this.transformRow(row)) as T[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
          hasMore: pageNum < pages,
        },
      };
    } catch (error) {
      console.error(`Error fetching paginated ${collection}:`, error);
      return { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0, hasMore: false } };
    }
  }

  // Transform Supabase snake_case to camelCase
  private transformRow(row: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      // Convert snake_case keys to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = value;
    }
    return transformed;
  }

  clearAll(): Promise<void> {
    console.warn('clearAll not supported in Supabase mode. Truncate tables directly in Supabase dashboard.');
    return Promise.resolve();
  }
}

export const db = new SupabaseService();

export const getDatabaseStatus = () => ({
  type: 'Supabase',
  url: SUPABASE_URL,
  message: 'Connected to Supabase',
});
