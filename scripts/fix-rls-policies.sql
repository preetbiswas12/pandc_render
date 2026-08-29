-- Fix RLS and ensure products table has all required columns
-- Run this in Supabase Dashboard > SQL Editor > New query

-- 1. Ensure all required columns exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'fabric';
ALTER TABLE products ADD COLUMN IF NOT EXISTS suit_type TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS handloom_type TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS length NUMERIC DEFAULT 0;

-- 2. Disable RLS on products table (since this is a public storefront with no user auth)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Also ensure admins table allows updates (needed for admin operations)
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Verify: Run this to check your products table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
