import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/productAPI';
import { fallbackProducts } from '../../data/fallbackProducts';
import { storage } from '../../utils/localStorage';

// Async thunk to fetch products from backend
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ category, search } = {}, { rejectWithValue }) => {
    try {
      const data = await productAPI.getAll({ category, search });
      return { products: data, apiMode: true };
    } catch (error) {
      // Offline fallback
      let filtered = storage.getSimulatedProducts() || [...fallbackProducts];
      if (category && category !== 'all') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.hindiName?.toLowerCase().includes(q)
        );
      }
      return { products: filtered, apiMode: false };
    }
  }
);

// Async thunk to fetch all products (for autocomplete / wishlist lookup)
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productAPI.getAll({});
      return data;
    } catch {
      return storage.getSimulatedProducts() || fallbackProducts;
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    allItems: [],
    loading: false,
    apiMode: true,
    selectedCategory: 'all',
    searchQuery: '',
    selectedProduct: null,
    error: null,
  },
  reducers: {
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
    },
    updateProductInList(state, action) {
      const updated = action.payload;
      const id = updated._id || updated.id;
      state.items = state.items.map((p) =>
        (p._id || p.id) === id ? updated : p
      );
      if (state.selectedProduct && (state.selectedProduct._id || state.selectedProduct.id) === id) {
        state.selectedProduct = updated;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.apiMode = action.payload.apiMode;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.allItems = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setSelectedProduct,
  updateProductInList,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.items;
export const selectAllProducts = (state) => state.products.allItems;
export const selectProductsLoading = (state) => state.products.loading;
export const selectApiMode = (state) => state.products.apiMode;
export const selectSelectedCategory = (state) => state.products.selectedCategory;
export const selectSearchQuery = (state) => state.products.searchQuery;
export const selectSelectedProduct = (state) => state.products.selectedProduct;

export default productSlice.reducer;
