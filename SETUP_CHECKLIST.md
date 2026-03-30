# 🔧 P&C Texfab - Local Development Setup Checklist

## ❌ ISSUES FIXED

### 1. ✅ Hardcoded Production URLs
- **razorpay.ts** - Fixed fallback to use env variable
- **shiprocket.ts** - Fixed fallback to use env variable  
- **App.tsx** - Fixed Clerk redirect URLs to use localhost

### 2. ✅ Backend Configuration
- **CORS_ORIGIN** changed from `http://pandctexfab.com` → `http://localhost:5173`
- **FRONTEND_URL** changed from `https://pandctexfab.com` → `http://localhost:5173`
- **CORS middleware** in index.js now properly configured with env variable

### 3. ✅ Frontend Environment
- **frontend/.env** created with localhost API URL
- **VITE_API_URL** = `http://localhost:5000/api`
- **VITE_APP_URL** = `http://localhost:5173`

## 🚀 STARTUP INSTRUCTIONS

### Step 1: Start Backend
```bash
cd backend
npm run dev
# or
node index.js
```
Expected output: `Server running on port 5000`

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
# or
npm run build && npm run preview
```
Expected output: `VITE v... ready in ... ms`

### Step 3: Open Browser
```
http://localhost:5173
```

## ✓ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173  
- [ ] No `ERR_NAME_NOT_RESOLVED` errors
- [ ] Products load on home page
- [ ] Admin login page accessible
- [ ] Network tab shows `localhost:5000/api` requests
- [ ] Console has NO "Failed to fetch" errors

## 🔑 Credentials

**Admin Login:**
- Email: `admin@pandctexfab.com`
- Password: `preetb121106`

## 📝 Important Files Modified

1. `frontend/.env` - Created with localhost config
2. `frontend/src/app/App.tsx` - Dynamic Clerk URLs
3. `frontend/src/app/services/razorpay.ts` - Fixed API URL fallback
4. `frontend/src/app/services/shiprocket.ts` - Fixed API URL fallback
5. `backend/.env` - Updated CORS and FRONTEND URLs
6. `backend/index.js` - Fixed CORS middleware configuration

## 🐛 If Still Getting Errors

1. **Clear browser cache** - Ctrl+Shift+Del
2. **Check Network tab** - Verify requests go to `localhost:5000`
3. **Check Console** - Look for specific error messages
4. **Restart both servers** - Kill and restart npm dev
5. **Check .env files** - Verify they have localhost URLs
