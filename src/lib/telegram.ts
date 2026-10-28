export interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): TelegramBackButton;
  offClick(callback: () => void): TelegramBackButton;
  show(): TelegramBackButton;
  hide(): TelegramBackButton;
}

export type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type NotificationType = "error" | "success" | "warning";

export interface TelegramHaptic {
  impactOccurred(style: ImpactStyle): TelegramHaptic;
  notificationOccurred(type: NotificationType): TelegramHaptic;
  selectionChanged(): TelegramHaptic;
}

type CloudCallback<T> = (error: Error | string | null, result?: T) => void;

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: CloudCallback<boolean>): TelegramCloudStorage;
  getItem(key: string, callback: CloudCallback<string>): TelegramCloudStorage;
  removeItem(key: string, callback?: CloudCallback<boolean>): TelegramCloudStorage;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export type TelegramEvent = "themeChanged" | "viewportChanged" | "safeAreaChanged" | "contentSafeAreaChanged" | "backButtonClicked";

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser; start_param?: string; query_id?: string };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHaptic;
  CloudStorage: TelegramCloudStorage;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  onEvent(event: TelegramEvent, handler: () => void): void;
  offEvent(event: TelegramEvent, handler: () => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  showAlert(message: string, callback?: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function detect(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const app = window.Telegram?.WebApp;
  if (!app) return null;
  const inside = app.initData.length > 0 || (app.platform !== "unknown" && app.platform.length > 0);
  return inside ? app : null;
}

export const tg: TelegramWebApp | null = detect();
export const inTelegram = tg !== null;

function atLeast(version: string): boolean {
  return tg !== null && typeof tg.isVersionAtLeast === "function" && tg.isVersionAtLeast(version);
}

export const features = {
  haptics: atLeast("6.1"),
  cloud: atLeast("6.9"),
  backButton: atLeast("6.1"),
  swipes: atLeast("7.7"),
  bottomBar: atLeast("7.10"),
  headerHex: atLeast("6.9"),
};

let hapticsOn = true;

export function setHaptics(on: boolean): void {
  hapticsOn = on;
}

export function initTelegram(): void {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (features.swipes) tg.disableVerticalSwipes?.();
}

export function hapticImpact(style: ImpactStyle = "light"): void {
  if (tg && features.haptics && hapticsOn) tg.HapticFeedback.impactOccurred(style);
}

export function hapticNotify(type: NotificationType): void {
  if (tg && features.haptics && hapticsOn) tg.HapticFeedback.notificationOccurred(type);
}

export function hapticSelection(): void {
  if (tg && features.haptics && hapticsOn) tg.HapticFeedback.selectionChanged();
}

export function openExternal(url: string): void {
  if (tg) tg.openLink(url);
  else window.open(url, "_blank", "noopener");
}

export function openTelegramLink(url: string): void {
  if (tg) tg.openTelegramLink(url);
  else window.open(url, "_blank", "noopener");
}

export function applyChromeColors(ground: string): void {
  if (!tg) return;
  try {
    tg.setBackgroundColor(ground);
    tg.setHeaderColor(features.headerHex ? ground : "bg_color");
    if (features.bottomBar) tg.setBottomBarColor?.(ground);
  } catch {
    return;
  }
}

export const cloud = {
  available: features.cloud,
  get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!tg || !features.cloud) return resolve(null);
      tg.CloudStorage.getItem(key, (error, value) => (error ? reject(error) : resolve(value ? value : null)));
    });
  },
  set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!tg || !features.cloud) return resolve();
      tg.CloudStorage.setItem(key, value, (error) => (error ? reject(error) : resolve()));
    });
  },
};
