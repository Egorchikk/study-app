import { useMemo } from "react";
import { t } from "../lib/i18n";
import { countPending, groupPending } from "../lib/model";
import type { Entry, Payload } from "../lib/types";
import { Card, CardHeader } from "../components/Card";
import { ItemRow, RowList } from "../components/ItemRow";
import { ScreenTitle } from "../components/ScreenTitle";

interface Props {
  payload: Payload;
  now: Date;
  onOpen(entry: Entry): void;
}

export function DeadlinesScreen({ payload, now, onOpen }: Props) {
  const groups = useMemo(() => groupPending(payload, now), [payload, now]);
  const counts = useMemo(() => countPending(payload, now), [payload, now]);
  const s = t().deadlines;

  return (
    <div>
      <ScreenTitle
        title={t().tabs.deadlines}
        subline={
          counts.total === 0 ? (
            s.allDone
          ) : (
            <>
              <span className="num font-semibold text-ink">{counts.total}</span> {s.left(counts.total)}
              {counts.overdue > 0 && (
                <>
                  {" · "}
                  <span className="num font-semibold text-negative">{counts.overdue}</span> {s.overdue}
                </>
              )}
            </>
          )
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        {groups.length === 0 && (
          <Card>
            <p className="px-5 py-5 text-[16px] leading-snug text-muted">{s.empty}</p>
          </Card>
        )}
        {groups.map((g) => (
          <Card key={g.key}>
            <CardHeader title={g.title} aside={<span className={`num text-[20px] font-semibold ${g.key === "overdue" ? "text-negative" : "text-accent"}`}>{g.entries.length}</span>} />
            <RowList className="pb-1">
              {g.entries.map((e) => (
                <ItemRow key={`${e.course.id}-${e.id}`} entry={e} now={now} onOpen={onOpen} />
              ))}
            </RowList>
          </Card>
        ))}
      </div>
    </div>
  );
}
