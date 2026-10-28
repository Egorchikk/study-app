import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CLOUD_SETTINGS } from "../lib/config";
import { setLang } from "../lib/i18n";
import { setSoonDays } from "../lib/model";
import { DEFAULT_SETTINGS, parseSettings, readLocalSettings, writeLocalSettings, type Settings } from "../lib/settings";
import { cloud, setHaptics } from "../lib/telegram";

interface SettingsState {
  settings: Settings;
  update(patch: Partial<Settings>): void;
  reset(): void;
}

const SettingsContext = createContext<SettingsState | null>(null);

function applyRuntime(settings: Settings): void {
  setLang(settings.lang);
  setSoonDays(settings.soonDays);
  setHaptics(settings.haptics);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(readLocalSettings);
  const latest = useRef(settings);
  const touched = useRef(false);
  latest.current = settings;
  applyRuntime(settings);

  useEffect(() => {
    let alive = true;
    cloud
      .get(CLOUD_SETTINGS)
      .then((raw) => {
        const remote = parseSettings(raw);
        if (!alive || touched.current || !remote) return;
        writeLocalSettings(remote);
        setSettings(remote);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  const commit = useCallback((next: Settings) => {
    touched.current = true;
    latest.current = next;
    setSettings(next);
    writeLocalSettings(next);
    void cloud.set(CLOUD_SETTINGS, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => commit({ ...latest.current, ...patch }), [commit]);
  const reset = useCallback(() => commit(DEFAULT_SETTINGS), [commit]);

  const value = useMemo<SettingsState>(() => ({ settings, update, reset }), [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("SettingsProvider missing");
  return ctx;
}
