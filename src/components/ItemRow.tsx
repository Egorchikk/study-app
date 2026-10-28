import { kindLabel, statusOf } from "../lib/model";
import type { Entry } from "../lib/types";
import { Icon } from "./Icon";
import { Pill } from "./Pill";
import { Tile } from "./Tile";

interface Props {
  entry: Entry;
  now: Date;
  onOpen(entry: Entry): void;
  showCourse?: boolean;
}

export function ItemRow({ entry, now, onOpen, showCourse = true }: Props) {
  const status = statusOf(entry, now);
  const kind = kindLabel(entry);
  return (
    <li>
      <button type="button" onClick={() => onOpen(entry)} className="pressable flex min-h-[60px] w-full items-center gap-3 px-5 py-2.5 text-left">
        {showCourse ? <Tile code={entry.course.short} /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-tile text-tile-ink"><Icon name={entry.kind === "quiz" ? "quiz" : "assign"} size={20} /></span>}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-[16px] leading-snug font-medium">{entry.name}</span>
          <span className="block truncate text-[14px] leading-snug text-muted">{showCourse ? `${entry.course.short} · ${kind}` : kind}</span>
        </span>
        <Pill tone={status.tone}>{status.text}</Pill>
      </button>
    </li>
  );
}

export function RowList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ul className={`divide-y divide-rule ${className}`}>{children}</ul>;
}
