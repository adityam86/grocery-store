import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogIn } from 'lucide-react';
import UserProfile from '../../components/UserProfile';
import { selectUser, updateUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTheme, themeObj } = useTheme();

  const isDark = currentTheme === 'midnight';

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDark
            ? 'bg-neutral-950 text-neutral-100'
            : 'bg-neutral-50 text-neutral-800'
        }`}
      >
        <div
          className={`rounded-3xl p-10 shadow-xl border flex flex-col items-center gap-6 max-w-sm w-full text-center ${
            isDark
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-white border-neutral-200'
          }`}
        >
          {/* Decorative icon */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${
              isDark ? 'bg-neutral-800' : 'bg-saffron-50'
            }`}
          >
            <UserCircle
              className={`w-10 h-10 ${themeObj.accentText}`}
            />
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-2">
              Account Required
            </h2>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Please log in to view and manage your profile details.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-md transition-all active:scale-95 ${themeObj.primary}`}
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-neutral-950 text-neutral-100'
          : 'bg-neutral-50 text-neutral-800'
      }`}
    >
      {/* Page header stripe */}
      <div
        className={`w-full border-b ${
          isDark
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-white border-neutral-200'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              isDark ? 'bg-neutral-800' : 'bg-saffron-50'
            }`}
          >
            <UserCircle
              className={`w-5 h-5 ${themeObj.accentText}`}
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              My Profile
            </h1>
            <p
              className={`text-xs font-medium mt-0.5 ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Manage your account details and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <UserProfile
          user={user}
          onBack={() => navigate('/')}
          onUpdateUser={(u) => dispatch(updateUser(u))}
          currentTheme={currentTheme}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
