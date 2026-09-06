import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../services/authAPI';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const login = async (email, password) => {
    dispatch(loginStart());
    try {
      const data = await authAPI.login(email, password);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      return data;
    } catch (err) {
      dispatch(loginFailure(err.message));
      throw err;
    }
  };

  const register = async (fullName, email, password) => {
    dispatch(loginStart());
    try {
      const data = await authAPI.register(fullName, email, password);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      return data;
    } catch (err) {
      dispatch(loginFailure(err.message));
      throw err;
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  const refreshProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      dispatch(updateUser(data));
      return data;
    } catch (err) {
      console.warn('Profile refresh failed:', err.message);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    signOut,
    refreshProfile,
    isAdmin: user?.role === 'admin',
  };
};
