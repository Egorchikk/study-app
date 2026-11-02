import { describe, expect, it } from "vitest";
import { addCommand, deleteCommand, formatPrice, isDay, parsePrice, sortSubs, untilText } from "./subs";

const now = new Date(2026, 10, 2, 14, 0);
const sub = (id: string, until: string, price = 100) => ({ id, name: id, until, price });

describe("parsePrice", () => {
  it("accepts rubles with comma, dot and spaces", () => {
    expect(parsePrice("299")).toBe(299);
    expect(parsePrice("149,90")).toBe(149.9);
    expect(parsePrice("1 990 ₽")).toBe(1990);
    expect(parsePrice("0")).toBe(0);
  });

  it("rejects garbage", () => {
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("-5")).toBeNull();
    expect(parsePrice("1.234")).toBeNull();
  });
});

describe("untilText", () => {
  it("describes the time left", () => {
    expect(untilText(sub("a", "2026-11-02"), now)).toBe("заканчивается сегодня");
    expect(untilText(sub("a", "2026-11-03"), now)).toBe("заканчивается завтра");
    expect(untilText(sub("a", "2026-11-07"), now)).toBe("до 7 ноя · через 5 дней");
    expect(untilText(sub("a", "2026-10-30"), now)).toBe("закончилась 30 окт");
  });
});

describe("sortSubs", () => {
  it("puts the nearest first and ended ones last", () => {
    const list = [sub("late", "2026-12-20"), sub("ended", "2026-10-01"), sub("soon", "2026-11-04"), sub("ended2", "2026-10-20")];
    expect(sortSubs(list, now).map((s) => s.id)).toEqual(["soon", "late", "ended2", "ended"]);
  });
});

describe("commands", () => {
  it("encodes add and delete", () => {
    expect(addCommand("Плюс", "2026-12-01", 399)).toBe('sub_add:{"name":"Плюс","until":"2026-12-01","price":399}');
    expect(deleteCommand("ab12")).toBe("sub_del:ab12");
  });

  it("formats price and checks dates", () => {
    expect(formatPrice(1990).replace(/\s/g, " ")).toBe("1 990 ₽");
    expect(isDay("2026-12-01")).toBe(true);
    expect(isDay("01.12.2026")).toBe(false);
  });
});
