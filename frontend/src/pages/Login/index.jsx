import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { loginSuccess } from '../../redux/slices/authSlice';

// ── Offline mock helper ────────────────────────────────────────────────────────
const createMockSession = ({ isLogin, email, password, fullName }) => {
  if (
    email.toLowerCase() === 'admin@apnabazar.com' &&
    password === 'admin123'
  ) {
    return {
      user: {
        id: 'user-admin',
        fullName: 'Apna Bazar Admin',
        email: 'admin@apnabazar.com',
        role: 'admin',
      },
      token: 'mock-admin-token',
    };
  }
  return {
    user: {
      id: `user-${Date.now()}`,
      fullName: isLogin ? email.split('@')[0] : fullName,
      email: email.toLowerCase(),
      role: 'customer',
    },
    token: `mock-token-${Date.now()}`,
  };
};

// ── Input field component ──────────────────────────────────────────────────────
const FormInput = ({ icon: Icon, label, right, ...inputProps }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
        {label}
      </label>
      {right}
    </div>
    <div className="relative">
      <Icon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        {...inputProps}
        className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 transition-all placeholder:text-neutral-400"
      />
    </div>
  </div>
);

// ── Main LoginPage component ───────────────────────────────────────────────────
const LoginPage = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setLocalError(null);
    setFormData({ fullName: '', email: '', password: '' });
  };

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
      // loginSuccess is already dispatched inside useAuth hook
      setSuccess(true);
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      // ── Offline fallback ────────────────────────────────────────────────
      console.warn('API unavailable, using offline fallback:', err.message);
      setTimeout(() => {
        try {
          const mock = createMockSession({ ...formData, isLogin });
          dispatch(loginSuccess({ user: mock.user, token: mock.token }));
          setSuccess(true);
          setTimeout(() => navigate('/'), 800);
        } catch (mockErr) {
          setLocalError('Something went wrong. Please try again.');
          setLocalLoading(false);
        }
      }, 900);
      return;
    }

    setLocalLoading(false);
  };

  // ── Success flash ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 px-4">
        <div className="bg-white rounded-3xl p-10 shadow-2xl border border-neutral-200 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-800">
            {isLogin ? 'Welcome back!' : 'Account created!'}
          </h2>
          <p className="text-sm text-neutral-500">Redirecting to the store…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50/70 to-orange-50/80 px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-saffron-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-orange-100/30 rounded-full blur-2xl pointer-events-none" />

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-saffron-500/10 max-w-md w-full overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-saffron-400 via-amber-400 to-orange-400" />

        <div className="p-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-saffron-500 to-orange-500 flex items-center justify-center shadow-lg shadow-saffron-500/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-neutral-800 leading-none">
                Apna Bazar
              </h1>
              <p className="text-[10px] uppercase font-bold text-saffron-500 tracking-widest mt-0.5">
                Indian Grocery Store
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl p-1 mb-7 bg-neutral-100 border border-neutral-200">
            <button
              type="button"
              onClick={() => switchTab(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isLogin
                  ? 'bg-white shadow-sm text-neutral-800 border border-neutral-200/80'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchTab(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-white shadow-sm text-neutral-800 border border-neutral-200/80'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-800">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {isLogin
                ? 'Log in to access your orders, wishlist & more.'
                : 'Join thousands of happy shoppers on Apna Bazar.'}
            </p>
          </div>

          {/* Error banner */}
          {localError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name — signup only */}
            {!isLogin && (
              <FormInput
                icon={User}
                label="Full Name"
                type="text"
                name="fullName"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            )}

            {/* Email */}
            <FormInput
              icon={Mail}
              label="Email Address"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            {/* Password */}
            <FormInput
              icon={Lock}
              label="Password"
              right={
                isLogin && (
                  <span className="text-[10px] text-neutral-400 hover:text-saffron-500 cursor-pointer transition-colors">
                    Forgot?
                  </span>
                )
              }
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />

            {/* Admin hint */}
            {isLogin && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Try <strong>admin@apnabazar.com</strong> /{' '}
                  <strong>admin123</strong> to unlock the admin dashboard.
                  Any other email/password works too (offline mode).
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={localLoading}
              className="w-full py-3.5 bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600 disabled:from-neutral-300 disabled:to-neutral-300 disabled:cursor-not-allowed text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg shadow-saffron-500/25 transition-all active:scale-[0.98] cursor-pointer mt-2"
            >
              {localLoading
                ? '⏳ Processing…'
                : isLogin
                ? 'Log In →'
                : 'Create Account →'}
            </button>
          </form>

          {/* Switch prompt */}
          <p className="text-center text-xs text-neutral-500 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => switchTab(!isLogin)}
              className="font-bold text-saffron-600 hover:text-saffron-700 transition-colors cursor-pointer"
            >
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>

        {/* Back link footer */}
        <div
          className={`px-8 py-4 border-t border-neutral-100 flex items-center justify-center`}
        >
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-saffron-500 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
