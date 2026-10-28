import { useEffect } from "react";
import { applyChromeColors } from "./telegram";

export function useTheme(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    const ground = getComputedStyle(root).getPropertyValue("--ground").trim();
    applyChromeColors(/^#[0-9a-f]{6}$/i.test(ground) ? ground : "#000000");
  }, []);
}
