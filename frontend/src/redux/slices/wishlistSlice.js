import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/api';
import { storage } from '../../utils/localStorage';

const getAuthHeader = () => ({
  Authorization: `Bearer ${storage.getToken()}`,
});

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(API_ENDPOINTS.WISHLIST, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.map((p) => p._id || p.id);
    } catch {
      return storage.getWishlist();
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState }) => {
    try {
      const res = await fetch(API_ENDPOINTS.WISHLIST_TOGGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      storage.setWishlist(data.wishlist);
      return data.wishlist;
    } catch {
      const current = getState().wishlist.items;
      const idx = current.indexOf(productId);
      const next = idx === -1
        ? [...current, productId]
        : current.filter((id) => id !== productId);
      storage.setWishlist(next);
      return next;
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: storage.getWishlist(),
    loading: false,
  },
  reducers: {
    clearWishlist(state) {
      state.items = [];
      storage.setWishlist([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(toggleWishlist.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.includes(productId);

export default wishlistSlice.reducer;
