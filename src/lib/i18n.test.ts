import { afterEach, describe, expect, it } from "vitest";
import { formatScore } from "./brs";
import { formatDay, formatLongDate, formatStamp, parseISO, relativeDue } from "./dates";
import { demoPayload } from "./demo";
import { setLang } from "./i18n";
import { finding, groupPending, setSoonDays, statusOf, urgencyOf } from "./model";
import type { Item } from "./types";

const now = new Date(2026, 9, 28, 9, 30);

function item(patch: Partial<Item>): Item {
  return { id: "x", name: "x", kind: "assign", due: null, dueText: "", opens: null, submitted: false, grade: "", status: "", hidden: false, url: "", ...patch };
}

afterEach(() => {
  setLang("ru");
  setSoonDays(3);
});

describe("english", () => {
  it("formats dates", () => {
    setLang("en");
    expect(formatDay(parseISO("2026-10-30T23:59"), now)).toBe("Oct 30");
    expect(formatDay(parseISO("2025-05-31T00:10"), now)).toBe("May 31, 2025");
    expect(formatLongDate(parseISO("2026-10-30T23:59"), now)).toBe("Friday, October 30, 23:59");
    expect(formatStamp("2026-10-27T10:05", now)).toBe("yesterday, 10:05");
    expect(relativeDue(parseISO("2026-10-31T23:59"), now)).toBe("in 3 days");
    expect(relativeDue(parseISO("2026-10-04T23:59"), now)).toBe("overdue by 24 days");
  });

  it("labels status, scores and the finding", () => {
    setLang("en");
    expect(statusOf(item({ due: "2026-10-30T23:59" }), now)).toEqual({ text: "due Oct 30", tone: "warning" });
    expect(formatScore(7.5)).toBe("7.5");
    expect(finding(demoPayload(now), now)).toBe("20 tasks not submitted, 3 overdue. Next deadline tomorrow by 18:00: Англ, Контрольная работа № 2.");
  });
});

describe("urgent horizon", () => {
  it("follows the chosen number of days", () => {
    const due = item({ due: "2026-11-02T23:59" });
    expect(urgencyOf(due, now)).toBe("week");
    setSoonDays(5);
    expect(urgencyOf(due, now)).toBe("soon");
    expect(groupPending(demoPayload(now), now).find((g) => g.key === "soon")!.title).toBe("Ближайшие 5 дней");
    setSoonDays(1);
    expect(urgencyOf(due, now)).toBe("week");
    expect(groupPending(demoPayload(now), now).find((g) => g.key === "soon")?.title ?? "Сегодня и завтра").toBe("Сегодня и завтра");
  });
});
