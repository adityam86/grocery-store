import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/localStorage';

const loadCart = () => storage.getCart();

const initialState = {
  items: loadCart(), // [{ product, quantity }]
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const productId = product._id || product.id;
      const existing = state.items.find(
        (item) => (item.product._id || item.product.id) === productId
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product, quantity: 1 });
      }
      storage.setCart(state.items);
    },
    removeFromCart(state, action) {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => (item.product._id || item.product.id) !== productId
      );
      storage.setCart(state.items);
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) => (item.product._id || item.product.id) !== productId
        );
      } else {
        const item = state.items.find(
          (i) => (i.product._id || i.product.id) === productId
        );
        if (item) item.quantity = quantity;
      }
      storage.setCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      storage.setCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

export default cartSlice.reducer;
