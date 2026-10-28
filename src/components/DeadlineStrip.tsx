import type { StripDay } from "../lib/model";
import { t } from "../lib/i18n";
import { hapticSelection } from "../lib/telegram";

interface Props {
  days: StripDay[];
  selected: string | null;
  onSelect(key: string | null): void;
}

export function DeadlineStrip({ days, selected, onSelect }: Props) {
  const s = t().strip;
  return (
    <div className="px-3 pt-2 pb-1">
      <ul className="grid grid-cols-7 gap-y-1" aria-label={s.label}>
        {days.map((d) => {
          const active = selected === d.key;
          const label = `${d.day} ${d.weekday}${d.count ? `, ${s.due(d.count)}` : ""}`;
          return (
            <li key={d.key} className="flex justify-center">
              <button
                type="button"
                aria-pressed={active}
                aria-label={label}
                disabled={d.count === 0}
                onClick={() => {
                  hapticSelection();
                  onSelect(active ? null : d.key);
                }}
                className={`pressable flex w-full max-w-[52px] flex-col items-center gap-0.5 rounded-[12px] px-0.5 pt-1.5 pb-1.5 disabled:pointer-events-none ${active ? "bg-active" : d.weekend ? "bg-raised/60" : ""}`}
              >
                <span className={`text-[12px] leading-none ${d.today ? "font-bold text-accent" : "text-muted"}`}>{d.weekday}</span>
                <span className={`num flex h-7 w-7 items-center justify-center rounded-full text-[15px] leading-none font-semibold ${d.today ? "bg-primary text-on-primary" : "text-ink"}`}>{d.day}</span>
                <span className="flex h-2 items-center justify-center gap-[3px]" aria-hidden="true">
                  {d.count > 3 ? (
                    <span className="num text-[11px] leading-none font-bold text-accent">{d.count}</span>
                  ) : (
                    Array.from({ length: d.count }, (_, i) => <span key={i} className="block h-1.5 w-1.5 rounded-full bg-accent" />)
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
