import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import OrderHistory from '../../components/OrderHistory';

const OrdersPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { themeObj } = useTheme();

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <OrderHistory user={user} onBack={() => navigate('/')} />
    </div>
  );
};

export default OrdersPage;
