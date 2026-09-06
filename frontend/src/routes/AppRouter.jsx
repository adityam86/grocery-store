import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import HomePage from '../pages/Home';
import WishlistPage from '../pages/Wishlist';
import CheckoutPage from '../pages/Checkout';
import OrdersPage from '../pages/Orders';
import OrderTrackingPage from '../pages/OrderTracking';
import ReviewsPage from '../pages/Reviews';
import ProfilePage from '../pages/Profile';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import AIAssistantPage from '../pages/AIAssistant';
import AdminPage from '../pages/Admin';

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = useSelector(selectUser);
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth pages (standalone, no main layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin layout - requires admin role */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Main layout - public + protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />

        {/* Protected routes */}
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:orderId/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
