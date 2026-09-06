import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  fetchAllProducts,
  setSelectedCategory,
  setSearchQuery,
  selectProducts,
  selectAllProducts,
  selectProductsLoading,
  selectApiMode,
  selectSelectedCategory,
  selectSearchQuery,
} from '../redux/slices/productSlice';

export const useProducts = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const allProducts = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const apiMode = useSelector(selectApiMode);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchQuery = useSelector(selectSearchQuery);

  // Fetch when category or search changes
  useEffect(() => {
    dispatch(fetchProducts({ category: selectedCategory, search: searchQuery }));
  }, [dispatch, selectedCategory, searchQuery]);

  // Fetch all products once for autocomplete / wishlist
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return {
    products,
    allProducts,
    loading,
    apiMode,
    selectedCategory,
    searchQuery,
    setCategory: (cat) => dispatch(setSelectedCategory(cat)),
    setSearch: (q) => dispatch(setSearchQuery(q)),
    refetch: () => dispatch(fetchProducts({ category: selectedCategory, search: searchQuery })),
  };
};
