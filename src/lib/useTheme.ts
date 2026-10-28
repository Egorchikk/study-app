import { useEffect, useState } from "react";
import { applyChromeColors, tg } from "./telegram";

export type Scheme = "light" | "dark";

function systemScheme(): Scheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): Scheme {
  const [scheme, setScheme] = useState<Scheme>(() => (tg ? tg.colorScheme : systemScheme()));

  useEffect(() => {
    if (!tg) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setScheme(media.matches ? "dark" : "light");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    const app = tg;
    const onTheme = () => setScheme(app.colorScheme);
    app.onEvent("themeChanged", onTheme);
    return () => app.offEvent("themeChanged", onTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = scheme;
    const ground = getComputedStyle(root).getPropertyValue("--ground").trim();
    if (/^#[0-9a-f]{6}$/i.test(ground)) applyChromeColors(ground);
  }, [scheme]);

  return scheme;
}
