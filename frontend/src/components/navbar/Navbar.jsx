import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Search, Palette, User, LogOut, Settings, History, Heart } from 'lucide-react';
import { selectCartCount, selectCartTotal } from '../../redux/slices/cartSlice';
import { selectUser, logout } from '../../redux/slices/authSlice';
import { selectAllProducts } from '../../redux/slices/productSlice';
import { setSearchQuery } from '../../redux/slices/productSlice';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../constants/themes';
import { addToCart } from '../../redux/slices/cartSlice';

const Navbar = ({ onOpenCart, onOpenAuth, searchQuery, onSearchChange }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTheme, themeObj, setTheme } = useTheme();
  const cartCount = useSelector(selectCartCount);
  const cartTotal = useSelector(selectCartTotal);
  const user = useSelector(selectUser);
  const allProducts = useSelector(selectAllProducts);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = searchQuery?.trim() && allProducts
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const isNight = currentTheme === 'midnight';

  return (
    <header className={`sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-500 ${isNight ? 'bg-neutral-950/80 border-neutral-800' : 'bg-white/80 border-neutral-200/80'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-8 flex flex-col gap-3">

        {/* Brand Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col cursor-pointer shrink-0 select-none group no-underline">
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-saffron-500 via-curry-500 to-cardamom-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-saffron-500/30 group-hover:rotate-6 transition-transform duration-300">A</span>
              <span className={`font-extrabold text-xl tracking-tight transition-colors duration-500 ${isNight ? 'text-white' : 'text-neutral-900'}`}>
                Apna <span className={themeObj.text}>Bazar</span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-0.5 ml-0.5">Premium Indian Grocery</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg relative group">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-saffron-500 transition-colors" />
            <input
              type="text"
              placeholder="Search spices, paneer, atta, or chai..."
              value={searchQuery}
              onChange={(e) => { onSearchChange(e.target.value); dispatch(setSearchQuery(e.target.value)); }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-full border text-sm focus:outline-none focus:ring-1 transition-all shadow-inner ${
                isNight
                  ? 'bg-neutral-900 border-neutral-800 text-white focus:border-curry-500 focus:ring-curry-500'
                  : 'bg-neutral-50/50 border-neutral-200 text-neutral-800 focus:border-saffron-500 focus:ring-saffron-500'
              }`}
            />
            {isFocused && suggestions.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl border overflow-hidden z-50 animate-fade-in ${
                isNight ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'
              }`}>
                <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Matching Items</div>
                {suggestions.map((p) => (
                  <div key={p.id || p._id} className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors gap-3">
                    <div className="flex-grow flex items-center gap-3 cursor-pointer" onClick={() => { onSearchChange(p.name); navigate('/'); }}>
                      <span className="text-base">{p.category === 'staples' ? '🌾' : p.category === 'spices' ? '🌶️' : p.category === 'dairy' ? '🥛' : p.category === 'beverages' ? '☕' : '🍪'}</span>
                      <div>
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-neutral-400">{p.hindiName} • {p.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold">₹{p.price}</span>
                      <button onClick={() => dispatch(addToCart(p))} className={`w-7 h-7 rounded-full flex items-center justify-center text-white border-none shadow-sm cursor-pointer hover:opacity-90 ${themeObj.primary.split(' ')[0]}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* User Button */}
            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-full text-xs font-bold transition-all cursor-pointer ${isNight ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${themeObj.primary.split(' ')[0]}`}>{user.fullName[0].toUpperCase()}</div>
                  <span className="hidden md:inline truncate max-w-[80px]">{user.fullName.split(' ')[0]}</span>
                </button>
                {showUserDropdown && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border p-2 z-50 animate-fade-in ${isNight ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'}`}>
                    <p className="text-[9px] uppercase font-bold text-neutral-400 px-3 py-1.5 tracking-wider border-b border-neutral-100 dark:border-neutral-800/60 pb-2">Account</p>
                    <div className="space-y-0.5 mt-1">
                      {[
                        { to: '/profile', icon: User, label: 'My Profile' },
                        { to: '/orders', icon: History, label: 'My Purchases' },
                        ...(user.role === 'admin' ? [{ to: '/admin', icon: Settings, label: 'Admin Console' }] : []),
                      ].map(({ to, icon: Icon, label }) => (
                        <button key={to} onClick={() => { navigate(to); setShowUserDropdown(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer">
                          <Icon className="w-4 h-4 text-neutral-400" /> {label}
                        </button>
                      ))}
                      <button onClick={() => { dispatch(logout()); setShowUserDropdown(false); navigate('/'); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer">
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onOpenAuth}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold transition-all cursor-pointer ${isNight ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}>
                <User className="w-4 h-4" /> Log In
              </button>
            )}

            {/* Theme Selector */}
            <div className="relative">
              <button onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${isNight ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
                title="Change Theme">
                <Palette className="w-4 h-4" />
              </button>
              {showThemeDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border p-2 z-50 animate-fade-in ${isNight ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'}`}>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 px-3 py-1.5 tracking-wider">Choose Theme</p>
                  <div className="space-y-1">
                    {Object.entries(THEMES).map(([key, value]) => (
                      <button key={key} onClick={() => { setTheme(key); setShowThemeDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                          currentTheme === key
                            ? isNight ? 'bg-neutral-800 text-curry-500' : 'bg-neutral-100 text-neutral-900'
                            : isNight ? 'hover:bg-neutral-800/50 text-neutral-400 hover:text-white' : 'hover:bg-neutral-50 text-neutral-600'
                        }`}>
                        <span>{value.name}</span>
                        <span className={`w-3.5 h-3.5 rounded-full ${value.dot}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button onClick={onOpenCart}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer group shrink-0 ${
                isNight ? 'bg-curry-500 hover:bg-curry-600 text-neutral-950 shadow-curry-500/10' : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-950/10'
              }`}>
              <div className="relative">
                <ShoppingBag className="w-4 h-4 group-hover:animate-bounce" />
                {cartCount > 0 && (
                  <span className={`absolute -top-2.5 -right-2 text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 animate-pulse ${
                    isNight ? 'bg-neutral-950 text-curry-500 border-curry-500' : 'bg-saffron-500 text-white border-neutral-900'
                  }`}>{cartCount}</span>
                )}
              </div>
              <span className="hidden sm:inline">₹{cartTotal}</span>
            </button>
          </div>
        </div>

        {/* Nav Links Row */}
        <div className="flex items-center gap-6 border-t border-neutral-200/20 dark:border-neutral-850/30 pt-2.5 text-[10px] font-extrabold uppercase tracking-widest">
          {[
            { to: '/', label: '🏪 Shop' },
            ...(user ? [
              { to: '/wishlist', label: '❤️ Wishlist' },
              { to: '/orders', label: '📋 My Purchases' },
              { to: '/profile', label: '👤 My Profile' },
              ...(user.role === 'admin' ? [{ to: '/admin', label: '⚙️ Admin Console' }] : []),
            ] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 pb-1.5 transition-all no-underline border-b-2 border-transparent ${
                isNight ? 'text-neutral-400 hover:text-curry-500 hover:border-curry-500' : 'text-neutral-400 hover:text-saffron-600 hover:border-saffron-500'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
