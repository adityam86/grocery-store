import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);
    try {
      let data;
      if (isLogin) {
        data = await login(formData.email, formData.password);
      } else {
        data = await register(formData.fullName, formData.email, formData.password);
      }
      if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      // Offline mock fallback
      const emailLower = formData.email.toLowerCase();
      if (emailLower === 'admin@apnabazar.com' && formData.password === 'admin123') {
        const mockUser = { id: 'user-admin', fullName: 'Apna Bazar Admin', email: emailLower, role: 'admin' };
        if (onAuthSuccess) onAuthSuccess(mockUser, null);
        onClose();
      } else {
        const mockUser = {
          id: `user-${Date.now()}`,
          fullName: isLogin ? formData.email.split('@')[0] : formData.fullName,
          email: emailLower,
          role: 'customer',
        };
        setLocalError('Backend offline — signing in with demo session.');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(mockUser, null);
          onClose();
          setLocalLoading(false);
        }, 800);
        return;
      }
    }
    setLocalLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl max-w-md w-full animate-fade-in text-neutral-800 dark:text-neutral-100">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex border-b border-neutral-100 dark:border-neutral-800 mb-6">
          {['Login', 'Sign Up'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => { setIsLogin(i === 0); setLocalError(null); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                (isLogin ? i === 0 : i === 1)
                  ? 'border-saffron-500 text-saffron-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {localError && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {localError}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input required type="text" name="fullName" placeholder="e.g. Rahul Sharma" value={formData.fullName} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] uppercase font-bold text-neutral-400">Password</label>
              {isLogin && <span className="text-[10px] text-neutral-400 hover:text-saffron-500 cursor-pointer">Forgot?</span>}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors" />
            </div>
          </div>

          {isLogin && (
            <p className="text-[10px] text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
              💡 Try <strong>admin@apnabazar.com</strong> / <strong>admin123</strong> for the Admin Console.
            </p>
          )}

          <button
            type="submit"
            disabled={localLoading}
            className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer mt-2"
          >
            {localLoading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
