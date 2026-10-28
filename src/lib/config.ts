export const BOT_USERNAME: string = typeof import.meta.env.VITE_BOT_USERNAME === "string" ? import.meta.env.VITE_BOT_USERNAME : "malishq_bot";
export const DATA_URL = `${import.meta.env.BASE_URL}data/state.json`;
export const KEY_STORAGE = "study-app:key";
export const CACHE_STORAGE = "study-app:cache";
export const CLOUD_KEY = "app_key";
export const SOON_DAYS = 3;
export const STRIP_DAYS = 14;
