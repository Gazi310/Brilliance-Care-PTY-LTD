import { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from '../services/api.js';
import { login as loginSvc, logout as logoutSvc, fetchMe } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from a stored token on first load.
  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          setUser(await fetchMe());
        } catch {
          logoutSvc();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const u = await loginSvc(email, password);
    setUser(u);
    return u;
  };

  const logout = () => {
    logoutSvc();
    setUser(null);
  };

  const value = { user, isAdmin: !!user?.isAdmin, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
