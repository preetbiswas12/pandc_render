# P&C Texfab

Premium fabric e-commerce platform built with React, TypeScript, and Supabase.

## Features

- Product catalog with fabric types (Cotton, Silk, Viscose, Linen, Wool, Print)
- Category-based browsing and search
- Shopping cart with quantity management
- Razorpay payment integration
- Order tracking and history
- Customer reviews and ratings
- Admin dashboard for managing products, orders, banners, and coupons
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (database + auth)
- **Payments**: Razorpay
- **Animations**: GSAP, Motion (Framer Motion)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root with the following:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_xxx
VITE_CURRENCY_SYMBOL=₹
VITE_CURRENCY_CODE=INR
VITE_STANDARD_SHIPPING_COST=199
VITE_FREE_SHIPPING_THRESHOLD=1999
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

1. Import the repo in Vercel
2. Set the **Framework Preset** to `Vite`
3. Set **Build Command** to `npm install && npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_CURRENCY_SYMBOL`
   - `VITE_CURRENCY_CODE`
   - `VITE_STANDARD_SHIPPING_COST`
   - `VITE_FREE_SHIPPING_THRESHOLD`

The `vercel.json` in the root handles SPA routing (all routes rewrite to `index.html`).

## Project Structure

```
src/
  app/
    components/   # Reusable UI components
    config/       # App configuration
    context/      # React context (AppContext, AdminContext)
    lib/          # Utility functions
    pages/        # Page components
      admin/      # Admin dashboard pages
    services/     # API services (Supabase, Razorpay, etc.)
  assets/         # Static assets
  styles/         # Global styles
```

## License

Private - P&C Texfab
