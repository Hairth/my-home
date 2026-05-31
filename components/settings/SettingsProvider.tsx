'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultSiteSettings,
  mergeSiteSettings,
  SETTINGS_STORAGE_KEY,
  type SiteSettings,
} from '@/lib/site-settings';

type SettingsContextValue = {
  settings: SiteSettings;
  isLoaded: boolean;
  setSettings: (updater: SiteSettings | ((current: SiteSettings) => SiteSettings)) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      let nextSettings = defaultSiteSettings;

      try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          nextSettings = mergeSiteSettings(JSON.parse(raw));
        }
      } catch {
        nextSettings = defaultSiteSettings;
      }

      if (cancelled) return;
      setSettingsState(nextSettings);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const setSettings = useCallback((updater: SiteSettings | ((current: SiteSettings) => SiteSettings)) => {
    setSettingsState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.sessionStorage.removeItem('my-home:welcome-seen');
    setSettingsState(defaultSiteSettings);
  }, []);

  const value = useMemo(
    () => ({ settings, isLoaded, setSettings, resetSettings }),
    [isLoaded, resetSettings, setSettings, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used inside SettingsProvider');
  }
  return context;
}
