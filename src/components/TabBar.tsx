import { t } from "../lib/i18n";
import { Icon, type IconName } from "./Icon";
import { Mark } from "./Mark";

export type Tab = "home" | "subjects" | "deadlines" | "brs" | "check";

export const TABS: { id: Tab; icon: IconName }[] = [
  { id: "home", icon: "home" },
  { id: "subjects", icon: "subjects" },
  { id: "deadlines", icon: "deadlines" },
  { id: "brs", icon: "brs" },
  { id: "check", icon: "check" },
];

interface Props {
  active: Tab | null;
  onChange(tab: Tab): void;
  overdue: number;
  semester: string;
  showCheck: boolean;
  settingsOpen: boolean;
  onSettings(): void;
}

export function TabBar({ active, onChange, overdue, semester, showCheck, settingsOpen, onSettings }: Props) {
  const s = t();
  const tabs = TABS.filter((tab) => showCheck || tab.id !== "check");
  return (
    <nav aria-label={s.nav} className="fixed inset-x-0 bottom-0 z-20 bg-surface pb-[var(--safe-bottom)] lg:static lg:inset-auto lg:w-56 lg:self-start lg:rounded-[20px] lg:pb-3">
      <div className="hidden items-center gap-3 px-5 pt-5 pb-6 lg:flex">
        <Mark size={30} />
        <span className="min-w-0">
          <span className="block text-[17px] leading-tight font-semibold">{s.brand}</span>
          <span className="num block truncate text-[13px] text-muted">{semester}</span>
        </span>
      </div>
      <ul className="flex items-stretch justify-around px-2 lg:flex-col lg:gap-1 lg:px-3">
        {tabs.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id} className="min-w-0 flex-1 lg:flex-none">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={current ? "page" : undefined}
                className={`pressable relative flex w-full flex-col items-center gap-1 rounded-2xl px-0 pt-2.5 pb-2 text-[12px] font-semibold lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-[15px] lg:font-medium ${current ? "text-accent lg:bg-active lg:text-ink" : "text-muted"}`}
              >
                <Icon name={tab.icon} size={22} className="lg:size-5" />
                <span>{s.tabs[tab.id]}</span>
                {tab.id === "deadlines" && overdue > 0 && (
                  <span className="num absolute top-1.5 right-[calc(50%-24px)] min-w-[18px] rounded-full bg-primary px-1 text-center text-[11px] leading-[18px] font-bold text-on-primary lg:static lg:ml-auto" aria-label={s.overdueBadge(overdue)}>
                    {overdue}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="hidden px-3 pt-3 lg:block">
        <button
          type="button"
          onClick={onSettings}
          aria-current={settingsOpen ? "page" : undefined}
          className={`pressable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium ${settingsOpen ? "bg-active text-ink" : "text-muted"}`}
        >
          <Icon name="settings" size={20} />
          <span>{s.tabs.settings}</span>
        </button>
      </div>
    </nav>
  );
}
