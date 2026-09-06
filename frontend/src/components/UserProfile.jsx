import React, { useState } from 'react';
import { ArrowLeft, User, MapPin, Lock, Trash2, Plus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { THEMES } from '../App';
import { API_ENDPOINTS } from '../constants/api';

const UserProfile = ({ user, onBack, onUpdateUser, currentTheme }) => {
  const themeObj = THEMES[currentTheme] || THEMES.saffron;

  // Profile Details State
  const [profileData, setProfileData] = useState({
    fullName: user ? user.fullName : '',
    email: user ? user.email : '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Address State
  const [newAddress, setNewAddress] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [addressLoading, setAddressLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('apna_bazar_token');
    try {
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email,
          currentPassword: profileData.currentPassword || undefined,
          newPassword: profileData.newPassword || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        if (onUpdateUser) onUpdateUser(data.user);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.warn('Profile API failed, falling back to local simulation:', err.message);
      
      // Offline fallback simulation
      setTimeout(() => {
        const updatedUser = {
          ...user,
          fullName: profileData.fullName,
          email: profileData.email
        };
        setMessage({ type: 'success', text: 'Profile updated successfully (Offline Sim)!' });
        setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        if (onUpdateUser) onUpdateUser(updatedUser);
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    setAddressLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('apna_bazar_token');
    try {
      const res = await fetch(API_ENDPOINTS.ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: newAddress.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewAddress('');
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            addresses: data.addresses
          });
        }
        setMessage({ type: 'success', text: 'Address added successfully!' });
      } else {
        throw new Error(data.message || 'Failed to add address');
      }
    } catch (err) {
      console.warn('Address API failed, falling back to offline simulation:', err.message);
      
      // Offline fallback simulation
      const currentAddresses = user.addresses ? [...user.addresses] : [];
      if (!currentAddresses.includes(newAddress.trim())) {
        currentAddresses.push(newAddress.trim());
      }
      const updatedUser = {
        ...user,
        addresses: currentAddresses
      };
      setNewAddress('');
      if (onUpdateUser) onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Address saved (Offline Sim)!' });
    }
    setAddressLoading(false);
  };

  const handleDeleteAddress = async (addressToDelete) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setAddressLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('apna_bazar_token');
    try {
      const res = await fetch(API_ENDPOINTS.ADDRESS, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: addressToDelete })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            addresses: data.addresses
          });
        }
        setMessage({ type: 'success', text: 'Address removed successfully!' });
      } else {
        throw new Error(data.message || 'Failed to remove address');
      }
    } catch (err) {
      console.warn('Address delete API failed, falling back to offline simulation:', err.message);
      
      // Offline fallback simulation
      const currentAddresses = user.addresses ? [...user.addresses] : [];
      const updatedAddresses = currentAddresses.filter(addr => addr !== addressToDelete);
      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };
      if (onUpdateUser) onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Address removed (Offline Sim)!' });
    }
    setAddressLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-neutral-850 dark:text-neutral-100 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-200 mb-6 transition-colors cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </button>

      <div className="flex items-center gap-3 mb-8">
        <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saffron-500 via-curry-500 to-cardamom-500 flex items-center justify-center text-white text-xl">
          👤
        </span>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">My Profile Settings</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage your personal credentials and saved shipping addresses</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400' 
            : 'bg-red-50 border-red-200 text-red-850 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile form & Password update */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <User className="w-5 h-5 text-neutral-400" /> Account Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                />
              </div>
            </div>

            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Lock className="w-5 h-5 text-neutral-400" /> Security Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Current Password (Needed only to change password)</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={profileData.currentPassword}
                  onChange={handleProfileChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleProfileChange}
                    placeholder="New password"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-saffron-500 hover:opacity-95 text-white font-bold text-xs tracking-wide rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md ${themeObj.primary.split(' ')[0]}`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Save Profile Updates'
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Address book */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <MapPin className="w-5 h-5 text-neutral-400" /> Saved Addresses
            </h3>

            {/* Address List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {!user.addresses || user.addresses.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  No saved addresses. Add one below to speed up your checkout.
                </div>
              ) : (
                user.addresses.map((addr, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl text-xs font-semibold"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300 leading-normal">📍 {addr}</span>
                    <button
                      type="button"
                      disabled={addressLoading}
                      onClick={() => handleDeleteAddress(addr)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1 border-none bg-transparent cursor-pointer disabled:opacity-50"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Address Form */}
            <form onSubmit={handleAddAddress} className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Add New Address</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  required
                  placeholder="Flat/Street name, City, Pincode"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="flex-grow px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-saffron-500"
                />
                <button
                  type="submit"
                  disabled={addressLoading}
                  className={`p-2 bg-saffron-500 hover:opacity-90 text-white rounded-xl flex items-center justify-center cursor-pointer border-none shadow-sm ${themeObj.primary.split(' ')[0]}`}
                  title="Add Address"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
