import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Store from "@/pages/Store";
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Documentation from "@/pages/Documentation";
import Changelog from "@/pages/Changelog";
import Support from "@/pages/Support";
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import AuthDiscordCallback from "@/pages/AuthDiscordCallback";
import Keymaster from "@/pages/Keymaster";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import MyProducts from "@/pages/dashboard/MyProducts";
import Downloads from "@/pages/dashboard/Downloads";
import Licenses from "@/pages/dashboard/Licenses";
import Orders from "@/pages/dashboard/Orders";
import Invoices from "@/pages/dashboard/Invoices";
import SupportTickets from "@/pages/dashboard/SupportTickets";
import Settings from "@/pages/dashboard/Settings";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminAdmins from "@/pages/admin/AdminAdmins";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminLicenses from "@/pages/admin/AdminLicenses";
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminEscrow from "@/pages/admin/AdminEscrow";

function PublicLayout() {
  const loc = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-[#080808]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={loc.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster theme="dark" position="top-center" richColors />
          <Routes>
            <Route path="/auth/discord" element={<AuthDiscordCallback />} />
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/store/:slug" element={<ProductDetail />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/documentation/:product" element={<Documentation />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/support" element={<Support />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/keymaster" element={<ProtectedRoute><Keymaster /></ProtectedRoute>} />
            </Route>

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="products" element={<MyProducts />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="licenses" element={<Licenses />} />
              <Route path="orders" element={<Orders />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="support" element={<SupportTickets />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="licenses" element={<AdminLicenses />} />
              <Route path="escrow" element={<AdminEscrow />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
