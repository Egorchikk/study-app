import { useMemo, useState } from "react";
import type { Command } from "../lib/actions";
import { formatStamp, plural } from "../lib/dates";
import { countPending, finding, stripDays, upcomingEntries, urgentEntries } from "../lib/model";
import type { Entry, Payload } from "../lib/types";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { DeadlineStrip } from "../components/DeadlineStrip";
import { Icon } from "../components/Icon";
import { ItemRow, RowList } from "../components/ItemRow";
import { QueueList } from "../components/QueueList";
import { ScreenTitle } from "../components/ScreenTitle";

interface Props {
  payload: Payload;
  now: Date;
  stale: boolean;
  error: string | null;
  refreshing: boolean;
  onReload(): void;
  onCommand(command: Command): void;
  onOpen(entry: Entry): void;
  onGoDeadlines(): void;
  onGoCheck(): void;
  canCheck: boolean;
}

const UPCOMING_LIMIT = 6;

export function HomeScreen({ payload, now, stale, error, refreshing, onReload, onCommand, onOpen, onGoDeadlines, onGoCheck, canCheck }: Props) {
  const [day, setDay] = useState<string | null>(null);
  const urgent = useMemo(() => urgentEntries(payload, now), [payload, now]);
  const upcoming = useMemo(() => upcomingEntries(payload, now), [payload, now]);
  const days = useMemo(() => stripDays(upcoming, now), [upcoming, now]);
  const counts = useMemo(() => countPending(payload, now), [payload, now]);
  const selectedDay = days.find((d) => d.key === day) ?? null;
  const shown = selectedDay ? selectedDay.entries : upcoming.slice(0, UPCOMING_LIMIT);
  const hiddenCount = selectedDay ? 0 : Math.max(0, upcoming.length - UPCOMING_LIMIT);
  const check = payload.reports.check;

  return (
    <div>
      <ScreenTitle
        title="Учёба"
        subline={
          <>
            СДО: <span className="num">{formatStamp(payload.updated, now)}</span>
            {stale && " · из кэша"}
          </>
        }
        aside={
          <Button variant="secondary" size="sm" onClick={() => onCommand("refresh")} aria-label="Обновить из СДО">
            <Icon name="refresh" size={18} />
            Обновить
          </Button>
        }
      />

      <p className="px-5 pb-4 text-[16px] leading-snug lg:px-0">{finding(payload, now)}</p>

      {error && (
        <p className="mx-5 mb-4 flex flex-wrap items-center gap-x-2 rounded-[14px] bg-surface px-4 py-3 text-[14px] leading-snug text-muted lg:mx-0">
          <span>Не удалось обновить данные{refreshing ? "" : `, показаны последние (${formatStamp(payload.updated, now)})`}.</span>
          <button type="button" onClick={onReload} className="pressable font-semibold text-accent">
            Повторить
          </button>
        </p>
      )}

      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <CardHeader title="Срочно" aside={<span className="num text-[20px] font-semibold text-accent">{urgent.length}</span>}>
            {counts.overdue > 0 ? `${counts.overdue} просрочено · ${counts.soon} ${plural(counts.soon, ["горит", "горят", "горят"])} в ближайшие 3 дня` : "просроченного нет, ближайшие 3 дня"}
          </CardHeader>
          {urgent.length > 0 ? (
            <RowList className="pb-1">
              {urgent.map((e) => (
                <ItemRow key={`${e.course.id}-${e.id}`} entry={e} now={now} onOpen={onOpen} />
              ))}
            </RowList>
          ) : (
            <p className="px-5 pt-1 pb-4 text-[16px] leading-snug text-muted">Ничего не горит: все сроки дальше трёх дней.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Две недели" aside={<span className="num text-[20px] font-semibold text-accent">{upcoming.length}</span>}>
            {upcoming.length > 0 ? `${upcoming.length} ${plural(upcoming.length, ["срок", "срока", "сроков"])} с сегодняшнего дня` : "сроков на две недели вперёд нет"}
          </CardHeader>
          <DeadlineStrip days={days} selected={day} onSelect={setDay} />
          {shown.length > 0 ? (
            <RowList className="pb-1">
              {shown.map((e) => (
                <ItemRow key={`${e.course.id}-${e.id}`} entry={e} now={now} onOpen={onOpen} />
              ))}
            </RowList>
          ) : (
            <p className="px-5 pt-2 pb-4 text-[16px] leading-snug text-muted">{selectedDay ? "В этот день сдавать нечего." : "Две недели свободны."}</p>
          )}
          {hiddenCount > 0 && (
            <div className="px-5 pt-1 pb-4">
              <button type="button" onClick={onGoDeadlines} className="pressable text-[15px] font-semibold text-accent">
                Ещё {hiddenCount} {plural(hiddenCount, ["срок", "срока", "сроков"])}, все сроки
              </button>
            </div>
          )}
        </Card>

        {canCheck && (
        <Card>
          <CardHeader title="Загрузка в СДО" aside={payload.queue.length > 0 ? <span className="num text-[20px] font-semibold text-accent">{payload.queue.length}</span> : undefined}>
            {check ? `проверка ${formatStamp(check.at, now)}` : "проверка ещё не запускалась"}
          </CardHeader>
          <QueueList queue={payload.queue} queueAt={payload.queueAt} now={now} onCommand={onCommand} compact />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pb-5">
            {payload.queue.length > 0 ? (
              <button type="button" onClick={() => onCommand("check")} className="pressable text-[15px] font-semibold text-accent">
                Проверить заново
              </button>
            ) : (
              <Button variant="secondary" onClick={() => onCommand("check")}>
                Проверить и подгрузить
              </Button>
            )}
            {check && (
              <button type="button" onClick={onGoCheck} className="pressable text-[15px] font-semibold text-accent">
                Отчёт проверки
              </button>
            )}
          </div>
        </Card>
        )}
      </div>
    </div>
  );
}
