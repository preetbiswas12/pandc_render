-- Add user_pfp column to ratings table
-- Run this in Supabase SQL Editor

ALTER TABLE ratings ADD COLUMN IF NOT EXISTS user_pfp TEXT;

-- Update existing rows with a default avatar based on user_email
UPDATE ratings 
SET user_pfp = 'https://ui-avatars.com/api/?name=' || COALESCE(user_name, user_email, 'Anonymous') || '&background=0057c2&color=fff&size=128'
WHERE user_pfp IS NULL;
