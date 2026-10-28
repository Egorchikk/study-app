import { createCipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { decryptBlob, fromBase64Url, isBlob } from "./crypto";

const KEY = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8";

function encryptNode(keyB64Url: string, text: string) {
  const key = Buffer.from(fromBase64Url(keyB64Url));
  const encKey = createHash("sha256").update(Buffer.concat([key, Buffer.from("enc")])).digest();
  const macKey = createHash("sha256").update(Buffer.concat([key, Buffer.from("mac")])).digest();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", encKey, iv);
  const ct = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = createHmac("sha256", macKey).update(Buffer.concat([iv, ct])).digest();
  return { v: 1, iv: iv.toString("base64"), ct: ct.toString("base64"), tag: tag.toString("base64") };
}

describe("decryptBlob", () => {
  it("decrypts a blob produced by the Python publisher", async () => {
    const blob = JSON.parse(readFileSync(new URL("./__fixtures__/blob.json", import.meta.url), "utf8"));
    const plain = readFileSync(new URL("./__fixtures__/plain.txt", import.meta.url), "utf8");
    expect(isBlob(blob)).toBe(true);
    const text = await decryptBlob(KEY, blob);
    expect(text).toBe(plain);
    expect(JSON.parse(text).courses[0].name).toBe("Тестовый курс — ёлка");
  });

  it("round-trips the same scheme implemented with node:crypto", async () => {
    const text = JSON.stringify({ hello: "мир", n: 42 });
    const blob = encryptNode(KEY, text);
    expect(await decryptBlob(KEY, blob)).toBe(text);
  });

  it("rejects a wrong key and a tampered ciphertext", async () => {
    const text = "secret";
    const blob = encryptNode(KEY, text);
    const otherKey = "ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmY";
    await expect(decryptBlob(otherKey, blob)).rejects.toThrow("wrong key");
    const bytes = Buffer.from(blob.ct, "base64");
    bytes[3] ^= 1;
    const tampered = { ...blob, ct: bytes.toString("base64") };
    await expect(decryptBlob(KEY, tampered)).rejects.toThrow("wrong key");
  });

  it("rejects malformed blobs", () => {
    expect(isBlob({ v: 2, iv: "", ct: "", tag: "" })).toBe(false);
    expect(isBlob(null)).toBe(false);
  });
});
