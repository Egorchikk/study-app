import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings, parseSettings } from "./settings";

describe("settings", () => {
  it("falls back to defaults for missing or broken values", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ mode: "neon", accent: 5, lang: "de", soonDays: 4, haptics: "yes", hidden: "x" })).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("{oops")).toBeNull();
    expect(parseSettings(null)).toBeNull();
  });

  it("keeps valid values and drops junk course ids", () => {
    const s = normalizeSettings({ mode: "light", accent: "blue", lang: "en", textSize: "large", startTab: "brs", soonDays: 7, haptics: false, hidden: ["12", 3, "40"] });
    expect(s).toEqual({ mode: "light", accent: "blue", lang: "en", textSize: "large", startTab: "brs", soonDays: 7, haptics: false, hidden: ["12", "40"] });
  });
});
