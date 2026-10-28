export const BOT_USERNAME: string = typeof import.meta.env.VITE_BOT_USERNAME === "string" ? import.meta.env.VITE_BOT_USERNAME : "egor_study_bot";
export const DATA_URL = `${import.meta.env.BASE_URL}data/state.json`;
export const KEY_STORAGE = "study-app:key";
export const CACHE_STORAGE = "study-app:cache";
export const CLOUD_KEY = "app_key";
export const SETTINGS_STORAGE = "study-app:settings";
export const CLOUD_SETTINGS = "settings";
export const SOON_DAYS = 3;
export const STRIP_DAYS = 14;
