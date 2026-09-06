import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { useTheme } from './hooks/useTheme';

// Export THEMES for legacy component compat (ProductDetailModal, UserProfile)
export { THEMES } from './constants/themes';

const AppContent = () => {
  const { currentTheme } = useTheme();
  useEffect(() => {
    if (currentTheme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default AppContent;
