import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import MainPage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfilePages from "./pages/UserDashboardPage";
import DealsPage from "./pages/DealsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function NavBar() {
  const location = useLocation();
  const pages = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/product", label: "Product" },
    { path: "/checkout", label: "Checkout" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/deals", label: "Deals" },
    { path: "/admin", label: "Admin" },
  ];
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-black/80 backdrop-blur rounded-full px-3 py-2 shadow-xl" style={{ fontFamily: "Inter, sans-serif" }}>
      {pages.map((p) => (
        <Link
          key={p.path}
          to={p.path}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            location.pathname === p.path
              ? "bg-[#0057c2] text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product" element={<ProductDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/dashboard" element={<UserProfilePages />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
