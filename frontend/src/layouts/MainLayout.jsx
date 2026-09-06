import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import CartModal from '../components/modals/CartModal';
import AuthModal from '../components/modals/AuthModal';
import OfflineBanner from '../components/notifications/OfflineBanner';
import { useSelector } from 'react-redux';
import { selectApiMode } from '../redux/slices/productSlice';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const apiMode = useSelector(selectApiMode);
  const { themeObj } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeObj.bg}`}>
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {!apiMode && <OfflineBanner />}

      <main className="flex-grow">
        <Outlet context={{ onOpenAuth: () => setIsAuthOpen(true), searchQuery }} />
      </main>

      <Footer />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user, token) => {
          // Redux state is already updated by the hook inside AuthModal
        }}
      />
    </div>
  );
};

export default MainLayout;
