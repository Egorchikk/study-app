import { CLOUD_KEY, KEY_STORAGE } from "./config";
import { cloud } from "./telegram";

const KEY_RE = /^[A-Za-z0-9_-]{43}$/;

export function keyFromLocation(href: string): string | null {
  try {
    const url = new URL(href);
    const fromQuery = url.searchParams.get("k");
    if (fromQuery && KEY_RE.test(fromQuery)) return fromQuery;
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    const fromHash = new URLSearchParams(hash).get("k");
    if (fromHash && KEY_RE.test(fromHash)) return fromHash;
  } catch {
    return null;
  }
  return null;
}

function readLocal(): string | null {
  try {
    const v = localStorage.getItem(KEY_STORAGE);
    return v && KEY_RE.test(v) ? v : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string): void {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    return;
  }
}

export async function resolveKey(): Promise<string | null> {
  const fromUrl = typeof window === "undefined" ? null : keyFromLocation(window.location.href);
  if (fromUrl) {
    writeLocal(fromUrl);
    void cloud.set(CLOUD_KEY, fromUrl).catch(() => undefined);
    return fromUrl;
  }
  const local = readLocal();
  if (local) return local;
  try {
    const remote = await cloud.get(CLOUD_KEY);
    if (remote && KEY_RE.test(remote)) {
      writeLocal(remote);
      return remote;
    }
  } catch {
    return null;
  }
  return null;
}
