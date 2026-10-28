import { useEffect, useLayoutEffect, useState } from "react";
import type { Accent, Mode, TextSize } from "./settings";
import { applyChromeColors, tg } from "./telegram";

type Scheme = "light" | "dark";

function systemScheme(): Scheme {
  if (tg) return tg.colorScheme === "light" ? "light" : "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function useSystemScheme(): Scheme {
  const [scheme, setScheme] = useState(systemScheme);
  useEffect(() => {
    const refresh = () => setScheme(systemScheme());
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", refresh);
    tg?.onEvent("themeChanged", refresh);
    return () => {
      media.removeEventListener("change", refresh);
      tg?.offEvent("themeChanged", refresh);
    };
  }, []);
  return scheme;
}

function toHex(color: string, fallback: string): string {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.fillStyle = fallback;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function useTheme(mode: Mode, accent: Accent, textSize: TextSize): void {
  const system = useSystemScheme();
  const scheme = mode === "auto" ? system : mode;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = scheme;
    root.dataset.accent = accent;
    root.dataset.size = textSize;
    const ground = toHex(getComputedStyle(root).getPropertyValue("--ground").trim(), scheme === "light" ? "#ffffff" : "#000000");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", ground);
    applyChromeColors(ground);
  }, [scheme, accent, textSize]);
}
