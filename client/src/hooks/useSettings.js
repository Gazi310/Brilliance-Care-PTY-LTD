import { useEffect, useState } from 'react';
import { getSettings } from '../services/settingsService';

/**
 * useSettings — read the public business settings.
 *
 * Thin wrapper over `getSettings()`, which memoises the request, so
 * however many components call this on one page there's still only one
 * trip to /api/settings.
 *
 * Returns `null` while loading *and* on failure. Nothing that reads
 * settings is load-bearing — every consumer already has a fallback
 * (the postcode check falls back to a format-only test, the footer to
 * its default copy), so a failed fetch should degrade quietly rather
 * than take a section down.
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let on = true;
    getSettings()
      .then((s) => on && setSettings(s))
      .catch(() => {}); // offline → consumers use their fallbacks
    return () => {
      on = false;
    };
  }, []);

  return settings;
}

export default useSettings;
