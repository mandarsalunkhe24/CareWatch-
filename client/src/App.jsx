// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import RoleRoute from './components/routing/RoleRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/auth/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/auth/NotFound';
import FamilyDashboard from './pages/FamilyDashboard';
import ElderSos from './pages/ElderSos';
import CaregiverDashboard from './pages/CaregiverDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import MonthlyHealthSummary from './pages/MonthlyHealthSummary';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/family"
                element={(
                  <RoleRoute allow={["family", "elder"]}>
                    <FamilyDashboard />
                  </RoleRoute>
                )}
              />
              <Route
                path="/elder-sos"
                element={(
                  <RoleRoute allow={["family", "elder"]}>
                    <ElderSos />
                  </RoleRoute>
                )}
              />
              <Route
                path="/caregiver"
                element={(
                  <RoleRoute allow={["caregiver"]}>
                    <CaregiverDashboard />
                  </RoleRoute>
                )}
              />
              <Route
                path="/doctor"
                element={(
                  <RoleRoute allow={["doctor"]}>
                    <DoctorDashboard />
                  </RoleRoute>
                )}
              />
              <Route
                path="/summary"
                element={(
                  <RoleRoute allow={["family", "elder", "doctor"]}>
                    <MonthlyHealthSummary />
                  </RoleRoute>
                )}
              />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;