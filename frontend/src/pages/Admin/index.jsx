import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import AdminDashboard from '../../components/AdminDashboard';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  return <AdminDashboard onBack={() => navigate('/')} currentTheme={currentTheme} />;
};

export default AdminPage;
