// src/pages/auth/Dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const role = user.role || 'family';
    if (role === 'elder') navigate('/elder-sos', { replace: true });
    else if (role === 'caregiver') navigate('/caregiver', { replace: true });
    else if (role === 'doctor') navigate('/doctor', { replace: true });
    else navigate('/family', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />
  );
};

// src/pages/Dashboard.jsx
export default Dashboard;