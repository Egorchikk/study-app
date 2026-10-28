import { useMemo } from "react";
import { plural } from "../lib/dates";
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

  return (
    <div>
      <ScreenTitle
        title="Сроки"
        subline={
          counts.total === 0 ? (
            "Всё сдано"
          ) : (
            <>
              <span className="num font-semibold text-ink">{counts.total}</span> {plural(counts.total, ["работа не сдана", "работы не сданы", "работ не сдано"])}
              {counts.overdue > 0 && (
                <>
                  {" · "}
                  <span className="num font-semibold text-negative">{counts.overdue}</span> просрочено
                </>
              )}
            </>
          )
        }
      />
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        {groups.length === 0 && (
          <Card>
            <p className="px-5 py-5 text-[16px] leading-snug text-muted">Несданных заданий и тестов нет.</p>
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
