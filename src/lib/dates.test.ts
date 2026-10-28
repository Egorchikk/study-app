import { describe, expect, it } from "vitest";
import { daysBetween, formatDay, formatLongDate, formatStamp, parseISO, plural, relativeDue } from "./dates";

const now = new Date(2026, 9, 28, 9, 30);

describe("dates", () => {
  it("parses ISO minutes as local time", () => {
    const d = parseISO("2026-10-30T23:59");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(30);
    expect(d.getHours()).toBe(23);
    expect(Number.isNaN(parseISO("nope").getTime())).toBe(true);
  });

  it("counts calendar days", () => {
    expect(daysBetween(now, parseISO("2026-10-30T00:10"))).toBe(2);
    expect(daysBetween(now, parseISO("2026-10-28T23:59"))).toBe(0);
    expect(daysBetween(parseISO("2026-10-26T23:59"), now)).toBe(2);
  });

  it("formats days and stamps in Russian", () => {
    expect(formatDay(parseISO("2026-10-30T23:59"), now)).toBe("30 окт");
    expect(formatDay(parseISO("2025-05-31T00:10"), now)).toBe("31 мая 2025");
    expect(formatLongDate(parseISO("2026-10-30T23:59"), now)).toBe("пятница, 30 октября, 23:59");
    expect(formatStamp("2026-10-28T08:51", now)).toBe("сегодня, 08:51");
    expect(formatStamp("2026-10-27T10:05", now)).toBe("вчера, 10:05");
    expect(formatStamp("2026-10-20T10:05", now)).toBe("20 окт, 10:05");
    expect(formatStamp(null, now)).toBe("нет данных");
  });

  it("describes relative deadlines", () => {
    expect(relativeDue(parseISO("2026-10-28T23:59"), now)).toBe("сегодня до 23:59");
    expect(relativeDue(parseISO("2026-10-29T18:00"), now)).toBe("завтра до 18:00");
    expect(relativeDue(parseISO("2026-10-31T23:59"), now)).toBe("через 3 дня");
    expect(relativeDue(parseISO("2026-10-27T23:59"), now)).toBe("просрочено вчера");
    expect(relativeDue(parseISO("2026-10-04T23:59"), now)).toBe("просрочено 24 дня назад");
    expect(relativeDue(parseISO("2026-10-28T08:00"), now)).toBe("просрочено сегодня");
  });

  it("chooses plural forms", () => {
    expect(plural(1, ["день", "дня", "дней"])).toBe("день");
    expect(plural(3, ["день", "дня", "дней"])).toBe("дня");
    expect(plural(11, ["день", "дня", "дней"])).toBe("дней");
    expect(plural(21, ["день", "дня", "дней"])).toBe("день");
  });
});
