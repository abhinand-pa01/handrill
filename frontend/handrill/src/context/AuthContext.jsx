import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthAPI, UserAPI } from '../utils/api';
import { DEMO_ACCOUNTS, CUSTOMERS, WORKERS, ADMINS } from '../data/mockData';

const AuthContext = createContext(null);

// ── Demo account canonical IDs ─────────────────────────────────────────────
// Regardless of whether the user logs in via real backend (gets numeric DB id)
// or demo fallback, known demo emails ALWAYS map to these local IDs so that
// the frontend localStorage data (bookings, reviews, etc.) always matches.
const DEMO_EMAIL_TO_LOCAL_ID = {
  'customer@handrill.com': 'c1',
  'worker@handrill.com':   'w7',
  'admin@handrill.com':    'a1',
};

function getAllLocalUsers() {
  // Merge static users with any admin-added workers from localStorage
  try {
    const stored = localStorage.getItem('handrill_workers');
    const workers = stored ? JSON.parse(stored) : WORKERS;
    return [...CUSTOMERS, ...workers, ...ADMINS];
  } catch {
    return [...CUSTOMERS, ...WORKERS, ...ADMINS];
  }
}

function findLocalUserByEmail(email) {
  return getAllLocalUsers().find(u => u.email === email) || null;
}

/**
 * Normalise any user object so its `id` is always the LOCAL demo id when the
 * email is a known demo account.  For real backend users with novel emails,
 * the backend numeric id is kept as a string.
 */
function normaliseUser(userObj) {
  if (!userObj) return null;
  const localId = DEMO_EMAIL_TO_LOCAL_ID[userObj.email];
  // Override with local demo ID if we have one
  if (localId) {
    // Try to find the richer local user object (has _password etc.)
    const localUser = findLocalUserByEmail(userObj.email);
    return { ...(localUser || userObj), id: localId };
  }
  // Unknown email → keep as-is but stringify id for consistency
  return { ...userObj, id: String(userObj.id) };
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo,  setIsDemo]  = useState(false);

  // Demo passwords stored persistently (includes admin-added workers)
  const [demoPwds, setDemoPwds] = useState(() => {
    try {
      const stored = localStorage.getItem('handrill_demo_pwds');
      const base = {
        'customer@handrill.com': 'demo123',
        'worker@handrill.com':   'demo123',
        'admin@handrill.com':    'demo123',
      };
      return stored ? { ...base, ...JSON.parse(stored) } : base;
    } catch {
      return {
        'customer@handrill.com': 'demo123',
        'worker@handrill.com':   'demo123',
        'admin@handrill.com':    'demo123',
      };
    }
  });

  const saveDemoPwds = useCallback((updater) => {
    setDemoPwds(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('handrill_demo_pwds', JSON.stringify(next));
      return next;
    });
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('handrill_token');
    const savedUser  = localStorage.getItem('handrill_user');
    const savedDemo  = localStorage.getItem('handrill_is_demo') === 'true';
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Re-normalise in case the stored user has a stale numeric id
        setToken(savedToken);
        setUser(normaliseUser(parsed));
        setIsDemo(savedDemo);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // 1. Try real backend
    try {
      const data = await AuthAPI.login(email, password);
      // Normalise so demo emails always get local IDs
      const normUser = normaliseUser(data.user);
      const demoMode = !!DEMO_EMAIL_TO_LOCAL_ID[email];

      localStorage.setItem('handrill_token',   data.accessToken);
      if (data.refreshToken) localStorage.setItem('handrill_refresh', data.refreshToken);
      localStorage.setItem('handrill_user',    JSON.stringify(normUser));
      localStorage.setItem('handrill_is_demo', String(demoMode));
      setToken(data.accessToken);
      setUser(normUser);
      setIsDemo(demoMode);
      return { success: true, user: normUser };
    } catch { /* fall through to demo */ }

    // 2. Demo fallback
    const storedPwd = demoPwds[email];
    const localUser = findLocalUserByEmail(email);
    const effectivePwd = storedPwd || localUser?._password;

    if (localUser && effectivePwd && effectivePwd === password) {
      const normUser = normaliseUser(localUser);
      const fakeToken = 'demo_' + Date.now();
      localStorage.setItem('handrill_token',   fakeToken);
      localStorage.setItem('handrill_user',    JSON.stringify(normUser));
      localStorage.setItem('handrill_is_demo', 'true');
      setToken(fakeToken);
      setUser(normUser);
      setIsDemo(true);
      return { success: true, user: normUser };
    }

    throw new Error('Invalid email or password');
  }, [demoPwds]);

  // ── register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    // 1. Try real backend
    try {
      const res = await AuthAPI.register(formData);
      const normUser = normaliseUser(res.user);
      localStorage.setItem('handrill_token',   res.accessToken);
      if (res.refreshToken) localStorage.setItem('handrill_refresh', res.refreshToken);
      localStorage.setItem('handrill_user',    JSON.stringify(normUser));
      localStorage.setItem('handrill_is_demo', 'false');
      setToken(res.accessToken);
      setUser(normUser);
      setIsDemo(false);
      return { success: true, user: normUser };
    } catch { /* fall through to demo registration */ }

    // 2. Demo registration fallback
    if (!formData.email || !formData.password) throw new Error('Email and password required');
    if (findLocalUserByEmail(formData.email)) throw new Error('An account with this email already exists');

    const newId     = 'cust_' + Date.now();
    const newUser   = {
      id:       newId,
      name:     formData.name     || 'New User',
      email:    formData.email,
      phone:    formData.phone    || '',
      address:  formData.address  || '',
      role:     'CUSTOMER',
      avatar:   null,
      _password: formData.password,
    };

    // Persist this new customer to the local customers store
    const stored = localStorage.getItem('handrill_local_customers');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('handrill_local_customers', JSON.stringify([...existing, newUser]));

    // Register their password
    saveDemoPwds(prev => ({ ...prev, [formData.email]: formData.password }));

    const fakeToken = 'demo_' + Date.now();
    localStorage.setItem('handrill_token',   fakeToken);
    localStorage.setItem('handrill_user',    JSON.stringify(newUser));
    localStorage.setItem('handrill_is_demo', 'true');
    setToken(fakeToken);
    setUser(newUser);
    setIsDemo(true);
    return { success: true, user: newUser };
  }, [saveDemoPwds]);

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (!isDemo) {
      try { await AuthAPI.logout(); } catch { /* ignore */ }
    }
    ['handrill_token','handrill_refresh','handrill_user','handrill_is_demo'].forEach(k =>
      localStorage.removeItem(k)
    );
    setToken(null); setUser(null); setIsDemo(false);
  }, [isDemo]);

  // ── updateUser ───────────────────────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('handrill_user', JSON.stringify(next));
      // Also update in local customers store if present
      const stored = localStorage.getItem('handrill_local_customers');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const idx  = list.findIndex(u => u.id === prev.id);
          if (idx !== -1) {
            list[idx] = next;
            localStorage.setItem('handrill_local_customers', JSON.stringify(list));
          }
        } catch { /* ignore */ }
      }
      return next;
    });
  }, []);

  // ── deactivate account ───────────────────────────────────────────────────
  const deactivateAccount = useCallback(async () => {
    // Mark as deactivated in localStorage
    if (user) {
      const deactivated = JSON.parse(localStorage.getItem('handrill_deactivated') || '[]');
      localStorage.setItem('handrill_deactivated', JSON.stringify([...deactivated, user.email]));
    }
    await logout();
  }, [user, logout]);

  // ── changePassword ───────────────────────────────────────────────────────
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (isDemo) {
      const email   = user?.email;
      const current = demoPwds[email] || user?._password || 'demo123';
      if (currentPassword !== current) throw new Error('Current password is incorrect');
      saveDemoPwds(prev => ({ ...prev, [email]: newPassword }));
      updateUser({ _password: newPassword });
      return { success: true };
    }
    await UserAPI.changePassword({ currentPassword, newPassword });
    return { success: true };
  }, [isDemo, user, demoPwds, saveDemoPwds, updateUser]);

  // ── registerDemoWorker (called by AdminWorkers when adding a worker) ──────
  const registerDemoWorker = useCallback((email, password) => {
    saveDemoPwds(prev => ({ ...prev, [email]: password }));
  }, [saveDemoPwds]);

  return (
    <AuthContext.Provider value={{
      user, token, loading, isDemo,
      login, register, logout, updateUser, changePassword,
      deactivateAccount, registerDemoWorker,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
