import { describe, expect, it } from "vitest";
import { demoPayload } from "./demo";
import { countPending, courseProgress, finding, groupPending, isLocked, statusOf, stripDays, upcomingEntries, urgencyOf, urgentEntries } from "./model";
import type { Item } from "./types";

const now = new Date(2026, 9, 28, 9, 30);
const payload = demoPayload(now);

function item(patch: Partial<Item>): Item {
  return { id: "x", name: "x", kind: "assign", due: null, dueText: "", opens: null, submitted: false, grade: "", status: "", hidden: false, url: "", ...patch };
}

describe("model", () => {
  it("classifies urgency by calendar days", () => {
    expect(urgencyOf(item({ due: "2026-10-27T23:59" }), now)).toBe("overdue");
    expect(urgencyOf(item({ due: "2026-10-28T23:59" }), now)).toBe("today");
    expect(urgencyOf(item({ due: "2026-10-31T23:59" }), now)).toBe("soon");
    expect(urgencyOf(item({ due: "2026-11-03T23:59" }), now)).toBe("week");
    expect(urgencyOf(item({ due: "2026-11-20T23:59" }), now)).toBe("later");
    expect(urgencyOf(item({}), now)).toBe("nodate");
  });

  it("labels status", () => {
    expect(statusOf(item({ submitted: true, grade: "8,0" }), now)).toEqual({ text: "оценка 8,0", tone: "positive" });
    expect(statusOf(item({ submitted: true }), now)).toEqual({ text: "сдано", tone: "positive" });
    expect(statusOf(item({ due: "2026-10-20T23:59" }), now)).toEqual({ text: "просрочено", tone: "negative" });
    expect(statusOf(item({ due: "2026-10-30T23:59" }), now)).toEqual({ text: "до 30 окт", tone: "warning" });
    expect(statusOf(item({ due: "2026-11-30T23:59" }), now)).toEqual({ text: "до 30 ноя", tone: "neutral" });
    expect(statusOf(item({ opens: "2026-11-02T09:00", due: "2026-11-29T23:59" }), now)).toEqual({ text: "откроется 2 ноя", tone: "neutral" });
    expect(statusOf(item({}), now)).toEqual({ text: "без срока", tone: "neutral" });
    expect(isLocked(item({ opens: "2026-11-02T09:00" }), now)).toBe(true);
  });

  it("counts pending work in the demo data", () => {
    const counts = countPending(payload, now);
    const all = payload.courses.flatMap((c) => c.items).filter((i) => !i.submitted && !i.hidden);
    expect(counts.total).toBe(all.length);
    expect(counts.overdue).toBe(3);
    expect(counts.soon).toBe(3);
  });

  it("orders urgent and upcoming entries by due date", () => {
    const urgent = urgentEntries(payload, now);
    expect(urgent.map((e) => e.name)).toEqual(["Практическое задание 1", "Практическое задание 2", "Практическое задание № 2", "Контрольная работа № 2", "Практическое задание № 1", "Практическое задание № 2"]);
    const upcoming = upcomingEntries(payload, now);
    expect(upcoming.every((e) => e.due !== null)).toBe(true);
    expect(upcoming[0].name).toBe("Контрольная работа № 2");
    expect(upcoming.map((e) => e.name)).not.toContain("Практическое задание 1");
  });

  it("builds the two-week strip from the upcoming entries", () => {
    const days = stripDays(upcomingEntries(payload, now), now);
    expect(days).toHaveLength(14);
    expect(days[0].today).toBe(true);
    expect(days[0].day).toBe(28);
    expect(days[1].count).toBe(1);
    expect(days[2].count).toBe(2);
    expect(days.reduce((n, d) => n + d.count, 0)).toBe(upcomingEntries(payload, now).length);
    expect(days[3].weekend).toBe(true);
  });

  it("computes course progress", () => {
    const db = payload.courses.find((c) => c.short === "БД")!;
    expect(courseProgress(db)).toEqual({ done: 2, total: 6, pending: 4, ratio: 2 / 6 });
  });

  it("groups pending work", () => {
    const groups = groupPending(payload, now);
    expect(groups.map((g) => g.key)).toEqual(["overdue", "soon", "week", "later", "locked", "nodate"]);
    expect(groups[0].entries).toHaveLength(3);
    expect(groups.find((g) => g.key === "locked")!.entries.map((e) => e.name)).toContain("Практическое задание № 5");
  });

  it("writes the finding", () => {
    expect(finding(payload, now)).toBe("Не сдано 20 работ, 3 просрочено. Ближайший срок завтра до 18:00: Англ, Контрольная работа № 2.");
    expect(finding({ ...payload, courses: [] }, now)).toBe("Всё сдано.");
  });
});
