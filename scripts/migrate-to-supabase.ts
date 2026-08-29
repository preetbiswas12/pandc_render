import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAST_DB_DIR = join(__dirname, '..', 'past_db');
const SUPABASE_URL = 'https://guhsnbnbeyayhddwawmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aHNuYm5iZXlheWhkZHdhd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkzNjIsImV4cCI6MjEwMzIxNTM2Mn0.QURl7siJvzKX65HaxWUL-Iy0ntK6G7JW9NZ2-rAFn5k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate UUID v4 (simple implementation)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Transform MongoDB export to Supabase format
function transformMongoDoc(doc: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc)) {
    // Skip MongoDB internal fields
    if (key === '_id' || key === '__v') continue;

    // Transform dates
    if (value && typeof value === 'object' && '$date' in value) {
      transformed[key] = (value as { $date: string }).$date;
      continue;
    }

    // Transform ObjectId references
    if (key === 'category' && typeof value === 'object' && value !== null && '$oid' in value) {
      transformed[key] = (value as { $oid: string }).$oid;
      continue;
    }

    // Recursively transform nested objects
    if (Array.isArray(value)) {
      transformed[key] = value.map(item =>
        typeof item === 'object' && item !== null && !Array.isArray(item)
          ? transformMongoDoc(item as Record<string, unknown>)
          : item
      );
      continue;
    }

    if (value && typeof value === 'object') {
      transformed[key] = transformMongoDoc(value as Record<string, unknown>);
      continue;
    }

    transformed[key] = value;
  }

  return transformed;
}

async function migrate() {
  console.log('Starting migration...\n');

  // 1. Migrate Categories
  console.log('Migrating categories...');
  const categoriesRaw = JSON.parse(readFileSync(join(PAST_DB_DIR, 'fabric_store.categories.json'), 'utf-8'));

  // Build mapping from MongoDB _id to category slug
  const categoryIdMap: Record<string, string> = {};

  for (const cat of categoriesRaw) {
    const transformed = transformMongoDoc(cat);
    const mongoId = (cat._id as { $oid: string }).$oid;

    const { error } = await supabase
      .from('categories')
      .insert({
        id: generateId(),
        name: transformed.name,
        slug: transformed.slug,
        sub_categories: transformed.subCategories || [],
        is_active: transformed.isActive,
        created_at: transformed.createdAt,
        updated_at: transformed.updatedAt,
      });

    if (error) {
      console.error(`  Error inserting category ${transformed.name}:`, error.message);
    } else {
      console.log(`  ✓ ${transformed.name}`);
      categoryIdMap[mongoId] = transformed.slug as string;
    }
  }

  // 2. Migrate Banners
  console.log('\nMigrating banners...');
  const bannersRaw = JSON.parse(readFileSync(join(PAST_DB_DIR, 'fabric_store.banners.json'), 'utf-8'));

  for (const banner of bannersRaw) {
    const transformed = transformMongoDoc(banner);

    const { error } = await supabase
      .from('banners')
      .insert({
        id: generateId(),
        type: transformed.type,
        title: transformed.title,
        subtitle: transformed.subtitle,
        image: transformed.image,
        link: transformed.link,
        button_text: transformed.buttonText,
        is_active: transformed.isActive,
        order: transformed.order,
        created_at: transformed.createdAt,
        updated_at: transformed.updatedAt,
      });

    if (error) {
      console.error(`  Error inserting banner:`, error.message);
    } else {
      console.log(`  ✓ ${transformed.title}`);
    }
  }

  // 3. Migrate Products
  console.log('\nMigrating products...');
  const productsRaw = JSON.parse(readFileSync(join(PAST_DB_DIR, 'fabric_store.products.json'), 'utf-8'));

  for (const product of productsRaw) {
    const transformed = transformMongoDoc(product);
    const catId = String(product.category);
    const categorySlug = categoryIdMap[catId] || 'uncategorized';

    const { error } = await supabase
      .from('products')
      .insert({
        id: generateId(),
        sku: transformed.sku,
        name: transformed.name,
        price: transformed.price,
        offer_percentage: transformed.offerPercentage,
        quantity: transformed.quantity,
        category: categorySlug,
        sub_category: transformed.subCategory || '',
        fabric_type: transformed.fabricType || '',
        saree_type: transformed.sareeType || '',
        care_instructions: transformed.careInstructions,
        description: transformed.description,
        images: transformed.images,
        colors: transformed.colors,
        features: transformed.features,
        width: transformed.width,
        unit: transformed.unit,
        created_at: transformed.createdAt,
        updated_at: transformed.updatedAt,
      });

    if (error) {
      console.error(`  Error inserting product ${transformed.name}:`, error.message);
    } else {
      console.log(`  ✓ ${transformed.name} (${categorySlug})`);
    }
  }

  // 4. Migrate Coupons
  console.log('\nMigrating coupons...');
  const coupons = [
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 1000,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    },
    {
      code: 'SAVE500',
      discountType: 'fixed',
      discountValue: 500,
      minOrderValue: 3000,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 50,
      usedCount: 0,
      isActive: true,
    },
    {
      code: 'SUMMER20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 2000,
      maxDiscount: 1000,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 200,
      usedCount: 0,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    const { error } = await supabase
      .from('coupons')
      .insert({
        id: generateId(),
        code: coupon.code,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_order_value: coupon.minOrderValue,
        max_discount: coupon.maxDiscount,
        valid_from: coupon.validFrom,
        valid_to: coupon.validTo,
        usage_limit: coupon.usageLimit,
        used_count: coupon.usedCount,
        is_active: coupon.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`  Error inserting coupon ${coupon.code}:`, error.message);
    } else {
      console.log(`  ✓ ${coupon.code}`);
    }
  }

  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);

