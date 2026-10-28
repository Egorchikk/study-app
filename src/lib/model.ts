import { SOON_DAYS, STRIP_DAYS } from "./config";
import { addDays, dayKey, daysBetween, formatDay, formatTime, parseISO, relativeDue, startOfDay, weekdayIndex } from "./dates";
import { t } from "./i18n";
import type { Course, Entry, Item, Payload } from "./types";

let soonDays = SOON_DAYS;

export function setSoonDays(days: number): void {
  soonDays = days;
}

export function getSoonDays(): number {
  return soonDays;
}

export type Urgency = "overdue" | "today" | "soon" | "week" | "later" | "nodate";
export type Tone = "negative" | "warning" | "positive" | "neutral" | "accent";

export function dueDate(item: Item): Date | null {
  if (!item.due) return null;
  const d = parseISO(item.due);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function opensDate(item: Item): Date | null {
  if (!item.opens) return null;
  const d = parseISO(item.opens);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isLocked(item: Item, now: Date): boolean {
  const opens = opensDate(item);
  return opens !== null && opens.getTime() > now.getTime();
}

export function isPending(item: Item): boolean {
  return !item.submitted && !item.hidden;
}

export function urgencyOf(item: Item, now: Date): Urgency {
  const due = dueDate(item);
  if (!due) return "nodate";
  if (due.getTime() < now.getTime()) return "overdue";
  const days = daysBetween(now, due);
  if (days <= 0) return "today";
  if (days <= soonDays) return "soon";
  if (days <= 7) return "week";
  return "later";
}

export function entriesOf(payload: Payload): Entry[] {
  const out: Entry[] = [];
  for (const c of payload.courses) {
    const course = { id: c.id, short: c.short, name: c.name, url: c.url };
    for (const item of c.items) out.push({ ...item, course });
  }
  return out;
}

export function pendingEntries(payload: Payload): Entry[] {
  return entriesOf(payload).filter(isPending);
}

const COURSE_INDEX = new WeakMap<Payload, Map<string, number>>();

function courseOrder(payload: Payload): Map<string, number> {
  let map = COURSE_INDEX.get(payload);
  if (!map) {
    map = new Map(payload.courses.map((c, i) => [c.id, i]));
    COURSE_INDEX.set(payload, map);
  }
  return map;
}

export function sortByDue(list: Entry[], payload?: Payload): Entry[] {
  const order = payload ? courseOrder(payload) : null;
  return [...list].sort((a, b) => {
    const da = dueDate(a);
    const db = dueDate(b);
    if (da && db && da.getTime() !== db.getTime()) return da.getTime() - db.getTime();
    if (da && !db) return -1;
    if (!da && db) return 1;
    const oa = order?.get(a.course.id) ?? 0;
    const ob = order?.get(b.course.id) ?? 0;
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "ru");
  });
}

export function urgentEntries(payload: Payload, now: Date): Entry[] {
  const list = pendingEntries(payload).filter((e) => {
    const u = urgencyOf(e, now);
    return u === "overdue" || u === "today" || u === "soon";
  });
  return sortByDue(list, payload);
}

export function upcomingEntries(payload: Payload, now: Date, days = STRIP_DAYS): Entry[] {
  const end = addDays(startOfDay(now), days);
  const list = pendingEntries(payload).filter((e) => {
    const due = dueDate(e);
    return due !== null && due.getTime() >= now.getTime() && due.getTime() < end.getTime();
  });
  return sortByDue(list, payload);
}

export interface StripDay {
  key: string;
  date: Date;
  day: number;
  weekday: string;
  weekend: boolean;
  today: boolean;
  count: number;
  entries: Entry[];
}

export function stripDays(entries: Entry[], now: Date, days = STRIP_DAYS): StripDay[] {
  const byDay = new Map<string, Entry[]>();
  for (const e of entries) {
    const due = dueDate(e);
    if (!due) continue;
    const key = dayKey(due);
    const list = byDay.get(key) ?? [];
    list.push(e);
    byDay.set(key, list);
  }
  const start = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i);
    const key = dayKey(date);
    const list = byDay.get(key) ?? [];
    const wd = weekdayIndex(date);
    return { key, date, day: date.getDate(), weekday: t().dates.weekdaysShort[wd], weekend: wd >= 5, today: i === 0, count: list.length, entries: list };
  });
}

export interface Progress {
  done: number;
  total: number;
  pending: number;
  ratio: number;
}

export function courseProgress(course: Course): Progress {
  const visible = course.items.filter((i) => !i.hidden);
  const done = visible.filter((i) => i.submitted).length;
  const total = visible.length;
  return { done, total, pending: total - done, ratio: total === 0 ? 0 : done / total };
}

export interface Counts {
  total: number;
  overdue: number;
  soon: number;
  week: number;
}

export function countPending(payload: Payload, now: Date): Counts {
  const counts: Counts = { total: 0, overdue: 0, soon: 0, week: 0 };
  for (const e of pendingEntries(payload)) {
    counts.total += 1;
    const u = urgencyOf(e, now);
    if (u === "overdue") counts.overdue += 1;
    else if (u === "today" || u === "soon") counts.soon += 1;
    else if (u === "week") counts.week += 1;
  }
  return counts;
}

export function kindLabel(item: Item): string {
  return t().kinds[item.kind === "quiz" ? "quiz" : "assign"];
}

export function statusOf(item: Item, now: Date): { text: string; tone: Tone } {
  const s = t().status;
  if (item.submitted) {
    if (item.grade) return { text: s.grade(item.grade), tone: "positive" };
    return { text: s.submitted, tone: "positive" };
  }
  const opens = opensDate(item);
  if (opens && opens.getTime() > now.getTime()) return { text: s.opens(formatDay(opens, now)), tone: "neutral" };
  const due = dueDate(item);
  if (!due) return { text: s.noDue, tone: "neutral" };
  const u = urgencyOf(item, now);
  if (u === "overdue") return { text: s.overdue, tone: "negative" };
  if (u === "today") return { text: t().dates.todayUntil(formatTime(due)), tone: "warning" };
  if (u === "soon") return { text: s.until(formatDay(due, now)), tone: "warning" };
  return { text: s.until(formatDay(due, now)), tone: "neutral" };
}

export interface Group {
  key: string;
  title: string;
  entries: Entry[];
}

export function groupPending(payload: Payload, now: Date): Group[] {
  const groups: Record<string, Entry[]> = { overdue: [], soon: [], week: [], later: [], locked: [], nodate: [] };
  for (const e of sortByDue(pendingEntries(payload), payload)) {
    if (isLocked(e, now) && urgencyOf(e, now) !== "overdue") {
      groups.locked.push(e);
      continue;
    }
    const u = urgencyOf(e, now);
    if (u === "overdue") groups.overdue.push(e);
    else if (u === "today" || u === "soon") groups.soon.push(e);
    else if (u === "week") groups.week.push(e);
    else if (u === "later") groups.later.push(e);
    else groups.nodate.push(e);
  }
  const g = t().groups;
  const titles: [string, string][] = [
    ["overdue", g.overdue],
    ["soon", g.soon(soonDays)],
    ["week", g.week],
    ["later", g.later],
    ["locked", g.locked],
    ["nodate", g.nodate],
  ];
  return titles.filter(([key]) => groups[key].length > 0).map(([key, title]) => ({ key, title, entries: groups[key] }));
}

export function finding(payload: Payload, now: Date): string {
  const s = t().finding;
  const counts = countPending(payload, now);
  if (counts.total === 0) return s.allDone;
  const parts: string[] = [];
  parts.push(s.left(counts.total));
  if (counts.overdue > 0) parts.push(s.overdue(counts.overdue));
  const head = parts.join(", ") + ".";
  const next = upcomingEntries(payload, now, 365)[0];
  if (!next) return head;
  const due = dueDate(next);
  if (!due) return head;
  return `${head} ${s.next(relativeDue(due, now), next.course.short, next.name)}`;
}

export function courseById(payload: Payload, id: string): Course | undefined {
  return payload.courses.find((c) => c.id === id);
}

export function materialsByKind(course: Course): { folders: Course["materials"]; links: Course["materials"] } {
  const folders = course.materials.filter((m) => m.type === "folder");
  const links = course.materials.filter((m) => m.type !== "folder");
  return { folders, links };
}
