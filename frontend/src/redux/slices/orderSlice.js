import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/api';
import { storage } from '../../utils/localStorage';

const getAuthHeader = () => ({
  Authorization: `Bearer ${storage.getToken()}`,
  'Content-Type': 'application/json',
});

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.ORDERS}?userId=${userId}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch {
      const saved = storage.getSimulatedOrders();
      return saved.filter((o) => o.userId === userId);
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      return data.order;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastPlacedOrder: null,
  },
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    addSimulatedOrder(state, action) {
      state.items.unshift(action.payload);
      const saved = storage.getSimulatedOrders();
      saved.unshift(action.payload);
      storage.setSimulatedOrders(saved);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.lastPlacedOrder = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, addSimulatedOrder } = orderSlice.actions;

export const selectOrders = (state) => state.orders.items;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectLastPlacedOrder = (state) => state.orders.lastPlacedOrder;

export default orderSlice.reducer;
