import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginAsRole } = useAuth();
  const [email, setEmail] = useState('demo@carewatch.com');
  const [password, setPassword] = useState('demo');
  const [role, setRole] = useState('family');

  const onSubmit = (e) => {
    e.preventDefault();
    loginAsRole(role);
    navigate('/');
  };

  const roleBtn = (value, label, tone) => {
    const active = role === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setRole(value)}
        className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors border ${
          active
            ? `${tone} text-white border-transparent shadow-sm`
            : 'bg-white/70 dark:bg-gray-900/60 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-8 shadow-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-fuchsia-600/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-600/20 via-cyan-600/15 to-sky-600/20 blur-2xl" />

        <div className="relative">
          <div className="inline-flex items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-sm">
            CareWatch
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Demo login: pick your role and jump into the dashboard.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {roleBtn('family', 'Family', 'bg-gradient-to-br from-blue-600 to-indigo-600')}
            {roleBtn('elder', 'Elder', 'bg-gradient-to-br from-red-600 to-rose-600')}
            {roleBtn('caregiver', 'Caregiver', 'bg-gradient-to-br from-emerald-600 to-teal-600')}
            {roleBtn('doctor', 'Doctor', 'bg-gradient-to-br from-violet-600 to-fuchsia-600')}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="family">Family</option>
                <option value="elder">Elder</option>
                <option value="caregiver">Caregiver</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:from-black hover:to-gray-900 dark:bg-white dark:text-gray-900"
            >
              Login
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 p-3 text-xs text-gray-600 dark:text-gray-300">
            Demo note: role is stored locally for routing (no real auth yet).
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

