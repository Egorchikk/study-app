import { SETTINGS_STORAGE, SOON_DAYS } from "./config";
import { LANGS, type Lang } from "./i18n";

export type Mode = "auto" | "light" | "dark";
export type Accent = "pink" | "blue" | "mint" | "lilac" | "peach";
export type TextSize = "normal" | "large";
export type StartTab = "home" | "subjects" | "deadlines" | "brs";

export const MODES: Mode[] = ["light", "dark", "auto"];
export const ACCENTS: Accent[] = ["pink", "blue", "mint", "lilac", "peach"];
export const TEXT_SIZES: TextSize[] = ["normal", "large"];
export const START_TABS: StartTab[] = ["home", "subjects", "deadlines", "brs"];
export const SOON_OPTIONS = [1, 2, 3, 5, 7];

export interface Settings {
  mode: Mode;
  accent: Accent;
  lang: Lang;
  textSize: TextSize;
  startTab: StartTab;
  soonDays: number;
  haptics: boolean;
  hidden: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "dark",
  accent: "pink",
  lang: "ru",
  textSize: "normal",
  startTab: "home",
  soonDays: SOON_DAYS,
  haptics: true,
  hidden: [],
};

function pick<T>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function normalizeSettings(value: unknown): Settings {
  const v = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const d = DEFAULT_SETTINGS;
  return {
    mode: pick(MODES, v.mode, d.mode),
    accent: pick(ACCENTS, v.accent, d.accent),
    lang: pick(LANGS, v.lang, d.lang),
    textSize: pick(TEXT_SIZES, v.textSize, d.textSize),
    startTab: pick(START_TABS, v.startTab, d.startTab),
    soonDays: pick(SOON_OPTIONS, v.soonDays, d.soonDays),
    haptics: typeof v.haptics === "boolean" ? v.haptics : d.haptics,
    hidden: Array.isArray(v.hidden) ? v.hidden.filter((id): id is string => typeof id === "string") : d.hidden,
  };
}

export function parseSettings(raw: string | null): Settings | null {
  if (!raw) return null;
  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readLocalSettings(): Settings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_STORAGE)) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeLocalSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  } catch {
    return;
  }
}
