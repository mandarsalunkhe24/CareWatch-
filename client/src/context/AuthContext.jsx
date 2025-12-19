import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cw_role');
    setUser(null);
    setIsAuthenticated(false);
  };

  const loginAsRole = (role) => {
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('cw_role', role);
    setIsAuthenticated(true);
    setUser({ name: 'Demo User', role });
  };

  const loadUser = async () => {
    try {
      // Placeholder: simulate token check
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('cw_role') || 'family';
      if (token) {
        setIsAuthenticated(true);
        setUser({ name: 'Demo User', role });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, setUser, setIsAuthenticated, loadUser, loginAsRole, logout }),
    [user, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

