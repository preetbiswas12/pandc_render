/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
  readonly VITE_CURRENCY_SYMBOL: string;
  readonly VITE_CURRENCY_CODE: string;
  readonly VITE_BUSINESS_EMAIL: string;
  readonly VITE_BUSINESS_PHONE: string;
  readonly VITE_BUSINESS_ADDRESS: string;
  readonly VITE_FREE_SHIPPING_THRESHOLD: string;
  readonly VITE_STANDARD_SHIPPING_COST: string;
  readonly VITE_EXPRESS_SHIPPING_COST: string;
  readonly VITE_TAX_RATE: string;
  readonly VITE_ENABLE_WISHLIST: string;
  readonly VITE_ENABLE_REVIEWS: string;
  readonly VITE_ENABLE_CHAT_SUPPORT: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_MOCK_PAYMENTS: string;
  readonly VITE_GST_NUMBER: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_FACEBOOK_PIXEL_ID: string;
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_TWITTER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
