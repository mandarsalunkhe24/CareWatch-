// src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-blue-500/30 via-indigo-500/25 to-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,120,120,0.12)_1px,transparent_0)] [background-size:24px_24px] opacity-50 dark:opacity-30" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

