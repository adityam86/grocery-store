import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { selectCartTotal } from '../../redux/slices/cartSlice';
import { useTheme } from '../../hooks/useTheme';

// Import the existing CheckoutForm
import CheckoutForm from '../../components/CheckoutForm';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/slices/cartSlice';
import { addSimulatedOrder } from '../../redux/slices/orderSlice';
import { selectApiMode } from '../../redux/slices/productSlice';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiMode = useSelector(selectApiMode);
  const { themeObj } = useTheme();

  if (!user) return <Navigate to="/" replace />;

  return (
    <CheckoutForm
      user={user}
      onBack={() => navigate('/')}
      onOrderSuccess={(placedOrder) => {
        if (!apiMode) {
          dispatch(addSimulatedOrder({ ...placedOrder, userId: user.id || user._id }));
        }
        dispatch(clearCart());
        navigate('/orders');
      }}
    />
  );
};

export default CheckoutPage;
