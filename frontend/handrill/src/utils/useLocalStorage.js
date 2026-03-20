import { useState, useCallback } from 'react';

/**
 * Drop-in for useState that persists to localStorage.
 * SEED_VERSION: bump this string any time the initial data changes.
 * On mismatch the stored data is wiped and the new initial value is seeded.
 */
const SEED_VERSION = 'v5'; // bump when mockData changes
const VERSION_KEY  = 'handrill_seed_version';

function checkAndMigrateVersion() {
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored !== SEED_VERSION) {
    // New seed — clear all app state so fresh mockData is loaded
    const keep = ['handrill_token','handrill_refresh','handrill_user',
                  'handrill_is_demo','handrill_demo_pwds','handrill_disclaimer_accepted'];
    Object.keys(localStorage)
      .filter(k => k.startsWith('handrill_') && !keep.includes(k))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
  }
}

// Run once at module load
checkAndMigrateVersion();

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      return JSON.parse(item);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStored(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch { /* storage full */ }
      return next;
    });
  }, [key]);

  return [stored, setValue];
}
