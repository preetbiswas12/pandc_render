// Core types for the fabric e-commerce platform
// Product, CartItem, Order, Coupon, Banner types are now in database.ts and re-exported from AppContext

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'dyeable-fabric',
    name: 'Dyeable Fabrics',,
    subCategories: [
      { id: 'silk', name: 'Silk' },
      { id: 'linen', name: 'Linen' },
      { id: 'cotton', name: 'Cotton' },
      { id: 'viscose', name: 'Viscose' },
      { id: 'modal', name: 'Modal' }
    ]
  },
  {
    id: 'lining-fabric',
    name: 'Lining Fabrics',,
    subCategories: [
      { id: 'cotton-lining', name: 'Cotton' },
      { id: 'viscose-lining', name: 'Viscose' }
    ]
  },
  {
    id: 'printed-fabric',
    name: 'Printed Fabrics',,
    subCategories: [
      { id: 'handblock-print', name: 'Handblock Print' },
      { id: 'digital-print', name: 'Digital Print' }
    ]
  },
  {
    id: 'embroidered-fabric',
    name: 'Embroidered Fabrics',,
    subCategories: [
      { id: 'beaded-sequin', name: 'Beaded & Sequin Embroidery' },
      { id: 'traditional-embroidery', name: 'Traditional Embroidery' }
    ]
  }
];