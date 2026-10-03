// Environment configuration utility
// Access environment variables with type safety and defaults

export const config = {
  // App
  app: {
    name: import.meta.env.VITE_APP_NAME || 'P&c Texfab',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  },

  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Payment Gateway
  // NOTE: only the public key ID belongs here. It is bundled into the client
  // JavaScript and is visible to anyone. Never read a key secret, webhook
  // secret, or any other credential from import.meta.env — Vite inlines every
  // VITE_* variable into the shipped bundle. Secrets must be read from
  // process.env inside a server-side function only.
  payment: {
    gatewayKey: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_PAYMENT_GATEWAY_KEY || '',
  },

  // Razorpay
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  },

  // Google Services
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  },

  // Email
  email: {
    serviceApiKey: import.meta.env.VITE_EMAIL_SERVICE_API_KEY || '',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID || '',
  },

  // Social Media
  social: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
    twitter: import.meta.env.VITE_TWITTER_URL || '',
    whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  },

  // Business
  business: {
    email: import.meta.env.VITE_BUSINESS_EMAIL || 'pandctexfab@gmail.com',
    phone: import.meta.env.VITE_BUSINESS_PHONE || '+91-9876543210',
    address: import.meta.env.VITE_BUSINESS_ADDRESS || '123 Fabric Street, Mumbai, India',
  },

  // Shipping
  shipping: {
    freeThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 2000,
    standardCost: Number(import.meta.env.VITE_STANDARD_SHIPPING_COST) || 100,
    expressCost: Number(import.meta.env.VITE_EXPRESS_SHIPPING_COST) || 200,
  },

  // Tax
  tax: {
    rate: Number(import.meta.env.VITE_TAX_RATE) || 0,
    gstNumber: import.meta.env.VITE_GST_NUMBER || '',
  },

  // Currency
  currency: {
    symbol: import.meta.env.VITE_CURRENCY_SYMBOL || '₹',
    code: import.meta.env.VITE_CURRENCY_CODE || 'INR',
  },

  // Feature Flags
  features: {
    wishlist: import.meta.env.VITE_ENABLE_WISHLIST === 'true',
    reviews: import.meta.env.VITE_ENABLE_REVIEWS === 'true',
    chatSupport: import.meta.env.VITE_ENABLE_CHAT_SUPPORT === 'true',
  },

  // Admin
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL || 'pandctexfab@gmail.com',
  },

  // Clerk
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },

  // Development
  dev: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    mockPayments: import.meta.env.VITE_MOCK_PAYMENTS === 'true',
  },
};

// Checks that the variables the app cannot run without are actually present.
//
// This runs in production as well as dev, which matters more than it looks:
// Vite inlines every VITE_* variable at BUILD time, so a variable missing from
// the deployment dashboard is compiled into the bundle as an empty string and
// fails silently at runtime. There is no error until a customer reaches
// checkout. Logging here is the only chance to catch it beforehand.
export const validateEnv = () => {
  const errors: string[] = [];

  if (!config.supabase.url || !config.supabase.anonKey) {
    errors.push(
      'Supabase is not configured — products, cart and orders will fail. ' +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  if (!config.clerk.publishableKey) {
    errors.push(
      'Clerk is not configured — sign-in and sign-up are unavailable. ' +
        'Set VITE_CLERK_PUBLISHABLE_KEY.'
    );
  }

  if (!config.razorpay.keyId) {
    errors.push(
      'Razorpay is not configured — checkout will fail. Set VITE_RAZORPAY_KEY_ID ' +
        'on the deployment and REBUILD. Vite inlines this variable at build time, ' +
        'so adding it to the dashboard without a new build has no effect.'
    );
  }

  if (errors.length > 0) {
    console.error('%c⚠️ Missing environment variables', 'color:#b91c1c;font-weight:bold;font-size:14px');
    errors.forEach((error) => console.error(`  ✗ ${error}`));
  }
};

validateEnv();
