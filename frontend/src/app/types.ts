// Core types for the fabric e-commerce platform
// Product, CartItem, Order, Coupon, Banner types are in database-enhanced.ts and AppContext

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}
