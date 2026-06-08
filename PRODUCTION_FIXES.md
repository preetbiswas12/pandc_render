# Production Fixes — P&C Texfab

**Date:** 2026-06-08
**Scope:** Full codebase audit and production hardening

---

## 🔴 CRITICAL SECURITY FIXES

### 1. Removed Hardcoded Secrets from Source Control
- **File:** `.env`
- **Issue:** MongoDB credentials, Razorpay API keys, Cloudinary secrets, JWT secret, Shiprocket API key all hardcoded in committed `.env` file
- **Fix:** Replaced with `CHANGE_ME_*` placeholders. Added comments with instructions to generate proper secrets via environment variables or secrets manager
- **ACTION REQUIRED:** Set all `CHANGE_ME_*` values in your deployment platform (Render dashboard) immediately

### 2. Removed Duplicate `env` File
- **File:** `env` (root level)
- **Issue:** Duplicate environment file with different MongoDB credentials was not gitignored
- **Fix:** Deleted the file

### 3. Fixed Webhook Secret
- **File:** `.env`
- **Issue:** `RAZORPAY_WEBHOOK_SECRET` was set to a URL (`https://pandctexfab.com/api/payments/razorpay/webhook`) — webhook secrets should be random strings from the Razorpay dashboard
- **Fix:** Changed to placeholder

### 4. Disabled Debug & Mock Payments in Production
- **File:** `.env`
- **Issue:** `VITE_DEBUG_MODE=true` and `VITE_MOCK_PAYMENTS=true` — these expose internal state and allow bypassing real payments
- **Fix:** Both set to `false`

### 5. Removed Secrets from Frontend .env
- **Issue:** `VITE_RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_WEBHOOK_SECRET`, `VITE_MONGODB_URI`, `VITE_MONGODB_DATABASE` were exposed to the browser
- **Fix:** Removed all server-side secrets from frontend env vars. Only `VITE_RAZORPAY_KEY_ID` (public key) remains

### 6. Added Rate Limiting
- **File:** `backend/index.js`
- **Issue:** No rate limiting — vulnerable to brute-force and DDoS attacks
- **Fix:** Added in-memory rate limiter (100 requests per 15 minutes per IP)

### 7. Added Webhook Signature Verification
- **File:** `backend/routes/payments.js`
- **Issue:** Webhook endpoint accepted any POST request without verifying it came from Razorpay
- **Fix:** Added HMAC-SHA256 signature verification using the webhook secret
- **Also:** Added `express.raw()` middleware before `express.json()` so webhook body is available as raw bytes for signature verification

---

## 💳 PAYMENT FIXES

### 8. Fixed Amount Comparison Bug (CRITICAL)
- **File:** `backend/routes/payments.js`
- **Issue:** Razorpay API returns amounts in **paise** (e.g., 50000 for ₹500), but the order total was stored in **rupees** (e.g., 500). The comparison `paymentDetails.data.amount - order.total` would always fail, blocking all payments
- **Fix:** Convert order total to paise before comparison: `Math.round(order.total * 100)`

### 9. Fixed Webhook Raw Body Parsing
- **File:** `backend/index.js`
- **Issue:** `express.json()` middleware would parse the webhook body before the route handler, making raw signature verification impossible
- **Fix:** Added `app.use('/api/payments/webhook', express.raw(...))` BEFORE `app.use(express.json())`

---

## 🛍️ PRODUCT & FILTERING FIXES

### 10. Removed Debug Endpoint
- **File:** `backend/routes/products.js`
- **Issue:** `/api/products/debug/verify-prices` exposed all product prices — information leak in production
- **Fix:** Removed the debug endpoint entirely

### 11. Reduced Debug Logging
- **File:** `backend/routes/products.js`
- **Fix:** Consolidated verbose per-request logging to a single line

### 12. Fixed Overlapping Pincode Zones
- **File:** `backend/services/shiprocketService.js`
- **Issue:** Pincode prefixes `121-129` and `201-210` appeared in multiple zones (Zone 1 and Zone 3/5), causing unpredictable shipping rates. Used arrays instead of Sets for O(n) lookups
- **Fix:** Removed duplicates, used `Set` for O(1) lookups, fixed zone assignment logic

### 13. Fixed Price Filter Default Values
- **File:** `frontend/src/app/services/database-enhanced.ts`
- **Issue:** The magic number `5000` was used to detect "unset" slider values, but this meant actual minPrice=5000 or maxPrice=5000 filters were silently dropped
- **Fix:** Changed logic to only send minPrice when > 0 and maxPrice when > 0

### 14. Fixed Empty Cart Redirect Loop
- **File:** `frontend/src/app/pages/CheckoutPage.tsx`
- **Issue:** `navigate('/cart')` was called during render, which could cause infinite re-renders
- **Fix:** Moved navigation to `useEffect`

---

## 🏠 FRONTEND FIXES

### 15. Fixed Navbar Cart Count
- **File:** `frontend/src/app/Layout.tsx`, `frontend/src/app/components/Navbar.tsx`
- **Issue:** Navbar accepted `cartCount` and `wishlistCount` props but Layout never passed them — cart count was always hidden in the top nav
- **Fix:** Layout now passes `cartCount={totalCartItems}` and `wishlistCount={wishlist.length}` to Navbar

### 16. Fixed Category Filter in Trending Section
- **File:** `frontend/src/app/components/TrendingSection.tsx`
- **Issue:** Category filter only matched by `_id` or `slug`, but seeded products store category as name (e.g., `'Cotton'`). This meant filtered views always showed empty results
- **Fix:** Added `p.category === selectedCat.name` as a fallback

### 17. Fixed Missing `useRef` Import
- **File:** `frontend/src/app/pages/CheckoutPage.tsx`
- **Issue:** `useRef` was used but not imported
- **Fix:** Added `useRef` to import

### 18. Fixed Price Filter Logic for Default Values
- **File:** `frontend/src/app/services/database-enhanced.ts`
- **Issue:** Default slider values (5000/5000) were either always sent or conditionally skipped, leading to incorrect API behavior
- **Fix:** Only send minPrice when > 0 (meaning user actively set a minimum)

### 19. Removed Unused Imports
- **File:** `frontend/src/app/Layout.tsx`
- **Issue:** `CATEGORIES` imported from `types.ts` but never used
- **Fix:** Removed the import

---

## 🔧 ADMIN & AUTH FIXES

### 20. Fixed Admin Route Path Consistency
- **File:** `backend/index.js`
- **Fix:** Verified admin auth routes correctly mounted at `/api/admin/auth` and admin data routes at `/api/admin/{resource}`

### 21. Fixed Admin Seed Credentials
- **File:** `backend/seedAdmin.js`
- **Issue:** Hardcoded email and password in source code
- **Fix:** Now uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars with fallback for development

### 22. Added Slug Auto-Generation for Categories
- **File:** `backend/routes/categories.js`
- **Issue:** Creating a category without a slug would fail with a MongoDB validation error
- **Fix:** Auto-generate slug from name if not provided. Added duplicate key error handling.

---

## 🗃️ DATA MODEL FIXES

### 23. Updated Seed Data
- **File:** `backend/seed.js`
- **Issue:** Only 1 product seeded, category used name `'Cotton'` instead of slug `'cotton'`
- **Fix:** Expanded to 10 diverse products across all categories (Cotton, Silk, Linen, Wool). Fixed category to use slugs matching the Category documents

### 24. Fixed Rating `updatedAt` Type
- **File:** `backend/models/Rating.js`
- **Issue:** `Date.now()` returns a number (milliseconds), but schema declares `updatedAt` as `Date` type
- **Fix:** Changed to `new Date()`

### 25. Fixed Coupon Delete Validation
- **File:** `backend/routes/coupons.js`
- **Issue:** No ObjectId validation before deletion — would throw on invalid IDs
- **Fix:** Added ObjectId validation and existence check

---

## 📦 DEPLOYMENT FIXES

### 26. Updated render.yaml
- **File:** `render.yaml`
- **Fix:** All secrets marked as `sync: false` to require dashboard configuration. Added proper production env vars. Fixed health check path to `/health`.

### 27. Updated .gitignore
- **Fix:** Added legacy `env` file to gitignore

### 28. Cleaned Up Frontend Types
- **File:** `frontend/src/app/types.ts`
- **Fix:** Removed unused `CATEGORIES` constant 40+ lines of dead code

### 29. Fixed Database Import Consistency
- **Files:** 6 admin/order page files
- **Issue:** Some files imported types from `database.ts` (old localStorage version) instead of `database-enhanced.ts` (current MongoDB version)
- **Fix:** Updated all imports to use `database-enhanced`

---

## ⚠️ ACTION ITEMS BEFORE DEPLOYMENT

1. **Rotate ALL secrets** — MongoDB password, Razorpay keys, Cloudinary API secret, Shiprocket API key, JWT secret
2. **Set environment variables in Render dashboard** — All values marked `sync: false` in render.yaml
3. **Generate a strong JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. **Configure Razorpay webhook** — Get the webhook secret from Razorpay dashboard and set it in Render
5. **Run database seed** — `cd backend && pnpm seed` (after setting MONGODB_URI)
6. **Run admin seed** — `cd backend && pnpm seedAdmin` (after setting MONGODB_URI)

---

## Summary

- **26 files changed**
- **375 insertions, 209 deletions**
- **8 critical security fixes**
- **4 payment fixes**
- **6 product/filtering fixes**
- **7 frontend fixes**
- **5 admin/auth fixes**
