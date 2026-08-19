import { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from '../services/api.js';
import {
  login as loginSvc,
  register as registerSvc,
  logout as logoutSvc,
  updateProfile as updateProfileSvc,
  fetchMe,
} from '../services/authService.js';

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

  // Takes { name, email, password, phone } — see authService.register.
  const register = async (fields) => {
    const u = await registerSvc(fields);
    setUser(u);
    return u;
  };

  const logout = () => {
    logoutSvc();
    setUser(null);
  };

  // Profile edits go through the context so the header greeting and any
  // prefilled booking fields update the moment a card is saved, without a reload.
  const updateProfile = async (fields) => {
    const u = await updateProfileSvc(fields);
    setUser(u);
    return u;
  };

  const value = { user, isAdmin: !!user?.isAdmin, loading, login, register, logout, updateProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
