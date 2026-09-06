import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWishlist,
  toggleWishlist,
  clearWishlist,
  selectWishlistItems,
} from '../redux/slices/wishlistSlice';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const toggle = (productId, { onLoginRequired } = {}) => {
    if (!isAuthenticated) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    dispatch(toggleWishlist(productId));
  };

  const isInWishlist = (productId) => wishlistItems.includes(productId);

  return {
    wishlistItems,
    toggle,
    isInWishlist,
  };
};
