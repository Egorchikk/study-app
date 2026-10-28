import { CACHE_STORAGE, DATA_URL } from "./config";
import { decryptBlob, isBlob } from "./crypto";
import type { Payload } from "./types";

export function isPayload(value: unknown): value is Payload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.v === 1 && Array.isArray(v.courses) && Array.isArray(v.queue) && typeof v.reports === "object";
}

export function readCache(): Payload | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCache(payload: Payload): void {
  try {
    localStorage.setItem(CACHE_STORAGE, JSON.stringify(payload));
  } catch {
    return;
  }
}

export async function fetchPayload(key: string): Promise<Payload> {
  const url = `${DATA_URL}?t=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`data ${response.status}`);
  const blob: unknown = await response.json();
  if (!isBlob(blob)) throw new Error("bad blob");
  const text = await decryptBlob(key, blob);
  const parsed: unknown = JSON.parse(text);
  if (!isPayload(parsed)) throw new Error("bad payload");
  return parsed;
}
