import { formatLongDate, relativeDue } from "../lib/dates";
import { t } from "../lib/i18n";
import { dueDate, kindLabel, opensDate, statusOf } from "../lib/model";
import { openExternal } from "../lib/telegram";
import type { Entry } from "../lib/types";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Pill } from "../components/Pill";

interface Props {
  entry: Entry;
  now: Date;
  onGoCourse(courseId: string): void;
}

export function ItemSheet({ entry, now, onGoCourse }: Props) {
  const status = statusOf(entry, now);
  const due = dueDate(entry);
  const opens = opensDate(entry);
  const s = t().item;
  const rows: [string, React.ReactNode][] = [
    [s.course, entry.course.name],
    [s.type, kindLabel(entry)],
    [s.status, <Pill tone={status.tone}>{status.text}</Pill>],
  ];
  if (entry.status) rows.push([s.inSdo, entry.status]);
  if (entry.grade) rows.push([s.grade, <span className="num font-semibold">{entry.grade}</span>]);
  if (due) {
    rows.push([
      s.due,
      <>
        <span className="num">{formatLongDate(due, now)}</span>
        <span className="block text-[14px] text-muted">{entry.submitted ? "" : relativeDue(due, now)}</span>
      </>,
    ]);
  } else if (entry.dueText) {
    rows.push([s.due, entry.dueText]);
  }
  if (opens) rows.push([s.opens, <span className="num">{formatLongDate(opens, now)}</span>]);

  return (
    <div>
      <dl className="divide-y divide-rule">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 py-3">
            <dt className="shrink-0 text-[14px] leading-snug text-muted">{label}</dt>
            <dd className="min-w-0 text-right text-[16px] leading-snug">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <Button className="w-full" onClick={() => openExternal(entry.url)}>
          <Icon name="link" size={18} />
          {s.open}
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => onGoCourse(entry.course.id)}>
          {s.toCourse}
        </Button>
      </div>
    </div>
  );
}
