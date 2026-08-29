CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY['products','orders','coupons','categories','banners','guidelines'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.admins (email, password, role, permissions)
VALUES (
  'pandctexfab@gmail.com',
  '$2b$10$.5AOTwdwoloL0aqq9w70gePwYKG8f3EYN9umPGgOFsiGl6B.qgjcC',
  'super-admin',
  ARRAY['products','orders','coupons','categories','banners','guidelines']
) ON CONFLICT (email) DO NOTHING;