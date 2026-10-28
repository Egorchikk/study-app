import type { EncryptedBlob } from "./types";

function fromBase64(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return fromBase64(padded);
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data as BufferSource));
}

export function isBlob(value: unknown): value is EncryptedBlob {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.v === 1 && typeof v.iv === "string" && typeof v.ct === "string" && typeof v.tag === "string";
}

export async function decryptBlob(keyBase64Url: string, blob: EncryptedBlob): Promise<string> {
  const key = fromBase64Url(keyBase64Url);
  if (key.length !== 32) throw new Error("bad key length");
  const encoder = new TextEncoder();
  const encKey = await sha256(concat(key, encoder.encode("enc")));
  const macKey = await sha256(concat(key, encoder.encode("mac")));
  const iv = fromBase64(blob.iv);
  const ct = fromBase64(blob.ct);
  const tag = fromBase64(blob.tag);
  const hmacKey = await crypto.subtle.importKey("raw", macKey as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", hmacKey, tag as BufferSource, concat(iv, ct) as BufferSource);
  if (!ok) throw new Error("wrong key");
  const aesKey = await crypto.subtle.importKey("raw", encKey as BufferSource, { name: "AES-CBC" }, false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv as BufferSource }, aesKey, ct as BufferSource);
  return new TextDecoder().decode(plain);
}
