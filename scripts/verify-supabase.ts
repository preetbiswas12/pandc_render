import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://guhsnbnbeyayhddwawmp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aHNuYm5iZXlheWhkZHdhd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkzNjIsImV4cCI6MjEwMzIxNTM2Mn0.QURl7siJvzKX65HaxWUL-Iy0ntK6G7JW9NZ2-rAFn5k'
);

async function verify() {
  const [products, categories, banners, coupons] = await Promise.all([
    supabase.from('products').select('id, name, category, price').limit(20),
    supabase.from('categories').select('id, name, slug').limit(20),
    supabase.from('banners').select('id, title, type').limit(20),
    supabase.from('coupons').select('id, code, discount_type').limit(20),
  ]);

  console.log('=== PRODUCTS ===');
  products.data?.forEach(p => console.log(`  ${p.name} | ${p.category} | ₹${p.price}`));
  console.log(`Total: ${products.data?.length || 0}`);

  console.log('\n=== CATEGORIES ===');
  categories.data?.forEach(c => console.log(`  ${c.name} (${c.slug})`));
  console.log(`Total: ${categories.data?.length || 0}`);

  console.log('\n=== BANNERS ===');
  banners.data?.forEach(b => console.log(`  ${b.title} [${b.type}]`));
  console.log(`Total: ${banners.data?.length || 0}`);

  console.log('\n=== COUPONS ===');
  coupons.data?.forEach(c => console.log(`  ${c.code} | ${c.discount_type}`));
  console.log(`Total: ${coupons.data?.length || 0}`));
}

verify().catch(console.error);
