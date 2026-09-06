import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

const AdminLayout = () => {
  const user = useSelector(selectUser);
  const { themeObj, currentTheme } = useTheme();
  const isNight = currentTheme === 'midnight';

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeObj.bg}`}>
      <header className={`border-b px-6 py-4 flex items-center justify-between ${isNight ? 'bg-neutral-950 border-neutral-900' : 'bg-white border-neutral-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold ${isNight ? 'bg-curry-500' : 'bg-neutral-900'}`}>⚙️</div>
          <div>
            <h1 className="font-extrabold text-sm">Admin Console</h1>
            <p className="text-[10px] text-neutral-400">Apna Bazar Management Portal</p>
          </div>
        </div>
        <Link to="/" className="text-xs font-bold text-neutral-400 hover:text-saffron-500 transition-colors no-underline">← Back to Store</Link>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
