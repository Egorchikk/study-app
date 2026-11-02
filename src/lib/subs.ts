import { daysBetween, formatDay, parseISO, plural } from "./dates";
import type { Subscription } from "./types";

export const SUB_NAME_MAX = 60;

const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

export function formatPrice(price: number): string {
  return `${money.format(price)} ₽`;
}

export function parsePrice(text: string): number | null {
  const clean = text.replace(/[\s ₽]/g, "").replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return null;
  return Number(clean);
}

export function isDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISO(value).getTime());
}

export function daysLeft(sub: Subscription, now: Date): number {
  return daysBetween(now, parseISO(sub.until));
}

export function untilText(sub: Subscription, now: Date): string {
  const days = daysLeft(sub, now);
  const date = formatDay(parseISO(sub.until), now);
  if (days < 0) return `закончилась ${date}`;
  if (days === 0) return "заканчивается сегодня";
  if (days === 1) return "заканчивается завтра";
  return `до ${date} · через ${days} ${plural(days, ["день", "дня", "дней"])}`;
}

export function sortSubs(subs: Subscription[], now: Date): Subscription[] {
  return [...subs].sort((a, b) => {
    const ea = daysLeft(a, now) < 0;
    const eb = daysLeft(b, now) < 0;
    if (ea !== eb) return ea ? 1 : -1;
    return ea ? b.until.localeCompare(a.until) : a.until.localeCompare(b.until);
  });
}

export function addCommand(name: string, until: string, price: number): string {
  return `sub_add:${JSON.stringify({ name, until, price })}`;
}

export function deleteCommand(id: string): string {
  return `sub_del:${id}`;
}
