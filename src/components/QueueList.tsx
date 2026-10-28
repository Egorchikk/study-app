import type { Command } from "../lib/actions";
import { formatStamp } from "../lib/dates";
import { t } from "../lib/i18n";
import type { QueueEntry } from "../lib/types";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface Props {
  queue: QueueEntry[];
  queueAt: string | null;
  now: Date;
  onCommand(command: Command): void;
  compact?: boolean;
}

export function QueueList({ queue, queueAt, now, onCommand }: Props) {
  const s = t();
  if (queue.length === 0) {
    return <p className="px-5 pt-1 pb-4 text-[16px] leading-snug text-muted">{s.queue.empty(queueAt ? formatStamp(queueAt, now) : null)}</p>;
  }
  return (
    <div className="pb-4">
      <ul className="divide-y divide-rule">
        {queue.map((q, i) => (
          <li key={`${q.cmid}-${i}`} className="px-5 py-3">
            <p className="text-[16px] leading-snug font-medium">
              {q.course ? `${q.course}: ` : ""}
              {q.name}
            </p>
            <p className="mt-0.5 text-[14px] leading-snug text-muted">
              {q.files.join(", ")}
              {q.due ? s.queue.due(q.due) : ""}
            </p>
            {q.note && (
              <p className="mt-1 flex items-start gap-1.5 text-[14px] leading-snug text-warning">
                <Icon name="warn" size={16} className="mt-0.5 shrink-0" />
                {q.note}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 px-5 pt-3">
        <Button onClick={() => onCommand("up:submit")}>{s.commands["up:submit"]}</Button>
        <Button variant="secondary" onClick={() => onCommand("up:draft")}>
          {s.commands["up:draft"]}
        </Button>
        <Button variant="ghost" onClick={() => onCommand("up:no")}>
          {s.commands["up:no"]}
        </Button>
      </div>
    </div>
  );
}
