import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAST_DB_DIR = join(__dirname, '..', 'past_db');
const SUPABASE_URL = 'https://guhsnbnbeyayhddwawmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aHNuYm5iZXlheWhkZHdhd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkzNjIsImV4cCI6MjEwMzIxNTM2Mn0.QURl7siJvzKX65HaxWUL-Iy0ntK6G7JW9NZ2-rAFn5k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixCategories() {
  console.log('Fixing product categories...\n');

  // Load categories to build mapping
  const categoriesRaw = JSON.parse(readFileSync(join(PAST_DB_DIR, 'fabric_store.categories.json'), 'utf-8'));
  const categoryIdMap: Record<string, string> = {};

  for (const cat of categoriesRaw) {
    const mongoId = (cat._id as { $oid: string }).$oid;
    categoryIdMap[mongoId] = cat.slug;
  }

  // Get all products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, sku, name, category');

  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }

  console.log(`Found ${products?.length || 0} products\n`);

  // Load products from past_db to get their category mapping
  const productsRaw = JSON.parse(readFileSync(join(PAST_DB_DIR, 'fabric_store.products.json'), 'utf-8'));

  // Build sku -> category slug mapping
  const skuCategoryMap: Record<string, string> = {};
  for (const product of productsRaw) {
    const mongoCatId = product.category as string;
    skuCategoryMap[product.sku] = categoryIdMap[mongoCatId] || 'uncategorized';
  }

  // Update each product
  for (const product of products || []) {
    const newCategory = skuCategoryMap[product.sku] || product.category;
    if (newCategory !== product.category) {
      const { error } = await supabase
        .from('products')
        .update({ category: newCategory, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) {
        console.error(`  Error updating ${product.name}:`, error.message);
      } else {
        console.log(`  ✓ ${product.name}: ${product.category} → ${newCategory}`);
      }
    } else {
      console.log(`  = ${product.name}: already correct (${product.category})`);
    }
  }

  console.log('\n✅ Categories fixed!');
}

fixCategories().catch(console.error);
