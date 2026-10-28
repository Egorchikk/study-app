import { t } from "./i18n";

export { plural } from "./i18n";

export function parseISO(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (!m) return new Date(NaN);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds());
  return r;
}

export function dayKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function daysBetween(from: Date, to: Date): number {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatDay(d: Date, now: Date): string {
  const s = t();
  const base = s.dates.dayMonth(d.getDate(), d.getMonth());
  return d.getFullYear() === now.getFullYear() ? base : s.dates.withYear(base, d.getFullYear());
}

export function formatDayTime(d: Date, now: Date): string {
  return `${formatDay(d, now)}, ${formatTime(d)}`;
}

export function formatLongDate(d: Date, now: Date): string {
  const s = t();
  const base = s.dates.longDate(weekdayIndex(d), d.getDate(), d.getMonth());
  return `${d.getFullYear() === now.getFullYear() ? base : s.dates.withYear(base, d.getFullYear())}, ${formatTime(d)}`;
}

export function formatStamp(iso: string | null | undefined, now: Date): string {
  const s = t();
  if (!iso) return s.dates.noData;
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) return s.dates.noData;
  const diff = daysBetween(d, now);
  if (diff === 0) return s.dates.today(formatTime(d));
  if (diff === 1) return s.dates.yesterday(formatTime(d));
  return formatDayTime(d, now);
}

export function relativeDue(due: Date, now: Date): string {
  const s = t();
  if (due.getTime() < now.getTime()) {
    const days = daysBetween(due, now);
    if (days === 0) return s.dates.overdueToday;
    if (days === 1) return s.dates.overdueYesterday;
    return s.dates.overdueAgo(days);
  }
  const days = daysBetween(now, due);
  if (days === 0) return s.dates.todayUntil(formatTime(due));
  if (days === 1) return s.dates.tomorrowUntil(formatTime(due));
  return s.dates.inDays(days);
}

export function todayLine(now: Date): string {
  return t().dates.longDate(weekdayIndex(now), now.getDate(), now.getMonth());
}
