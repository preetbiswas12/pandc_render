import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://guhsnbnbeyayhddwawmp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aHNuYm5iZXlheWhkZHdhd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzkzNjIsImV4cCI6MjEwMzIxNTM2Mn0.QURl7siJvzKX65HaxWUL-Iy0ntK6G7JW9NZ2-rAFn5k');
async function main() {
  const { data, error } = await supabase.from('admins').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}
main().catch(console.error);
