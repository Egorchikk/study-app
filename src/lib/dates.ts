export const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
export const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
export const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
export const WEEKDAYS_FULL = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

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
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

export function formatDayTime(d: Date, now: Date): string {
  return `${formatDay(d, now)}, ${formatTime(d)}`;
}

export function formatLongDate(d: Date, now: Date): string {
  const year = d.getFullYear() === now.getFullYear() ? "" : ` ${d.getFullYear()}`;
  return `${WEEKDAYS_FULL[weekdayIndex(d)]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}${year}, ${formatTime(d)}`;
}

export function formatStamp(iso: string | null | undefined, now: Date): string {
  if (!iso) return "нет данных";
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) return "нет данных";
  const diff = daysBetween(d, now);
  if (diff === 0) return `сегодня, ${formatTime(d)}`;
  if (diff === 1) return `вчера, ${formatTime(d)}`;
  return formatDayTime(d, now);
}

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function relativeDue(due: Date, now: Date): string {
  if (due.getTime() < now.getTime()) {
    const days = daysBetween(due, now);
    if (days === 0) return "просрочено сегодня";
    if (days === 1) return "просрочено вчера";
    return `просрочено ${days} ${plural(days, ["день", "дня", "дней"])} назад`;
  }
  const days = daysBetween(now, due);
  if (days === 0) return `сегодня до ${formatTime(due)}`;
  if (days === 1) return `завтра до ${formatTime(due)}`;
  return `через ${days} ${plural(days, ["день", "дня", "дней"])}`;
}

export function todayLine(now: Date): string {
  return `${WEEKDAYS_FULL[weekdayIndex(now)]}, ${now.getDate()} ${MONTHS_GEN[now.getMonth()]}`;
}
