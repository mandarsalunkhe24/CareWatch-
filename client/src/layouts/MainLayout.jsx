// src/layouts/MainLayout.jsx
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const role = user?.role || 'family';

  const linkClass = ({ isActive }) => {
    return `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-sm">
              CareWatch
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 px-2 py-1">
                Role: <span className="font-semibold">{user?.role || 'family'}</span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {(role === 'family' || role === 'elder') && (
              <>
                <NavLink to="/family" className={linkClass}>
                  Family Dashboard
                </NavLink>
                <NavLink to="/elder-sos" className={linkClass}>
                  Elder SOS
                </NavLink>
                <NavLink to="/summary" className={linkClass}>
                  Summary
                </NavLink>
              </>
            )}

            {role === 'doctor' && (
              <>
                <NavLink to="/doctor" className={linkClass}>
                  Doctor Dashboard
                </NavLink>
                <NavLink to="/summary" className={linkClass}>
                  Summary
                </NavLink>
              </>
            )}

            {role === 'caregiver' && (
              <NavLink to="/caregiver" className={linkClass}>
                Caregiver Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-gradient-to-br from-red-600 to-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-rose-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default MainLayout;

