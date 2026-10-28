import { useMemo, useState } from "react";
import type { Command } from "../lib/actions";
import { formatStamp } from "../lib/dates";
import { t } from "../lib/i18n";
import { countPending, finding, getSoonDays, stripDays, upcomingEntries, urgentEntries } from "../lib/model";
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
  onSettings(): void;
  canCheck: boolean;
}

const UPCOMING_LIMIT = 6;

export function HomeScreen({ payload, now, stale, error, refreshing, onReload, onCommand, onOpen, onGoDeadlines, onGoCheck, onSettings, canCheck }: Props) {
  const s = t();
  const h = s.home;
  const soon = getSoonDays();
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
        title={s.brand}
        subline={
          <>
            {h.sdo}: <span className="num">{formatStamp(payload.updated, now)}</span>
            {stale && h.cached}
          </>
        }
        aside={
          <div className="flex items-center gap-2">
            <button type="button" onClick={onSettings} aria-label={s.tabs.settings} className="pressable flex h-9 w-9 items-center justify-center rounded-full bg-raised text-ink lg:hidden">
              <Icon name="settings" size={18} />
            </button>
            <Button variant="secondary" size="sm" onClick={() => onCommand("refresh")} aria-label={h.refreshLabel}>
              <Icon name="refresh" size={18} />
              {h.refresh}
            </Button>
          </div>
        }
      />

      <p className="px-5 pb-4 text-[16px] leading-snug lg:px-0">{finding(payload, now)}</p>

      {error && (
        <p className="mx-5 mb-4 flex flex-wrap items-center gap-x-2 rounded-[14px] bg-surface px-4 py-3 text-[14px] leading-snug text-muted lg:mx-0">
          <span>{h.failed(refreshing ? null : formatStamp(payload.updated, now))}</span>
          <button type="button" onClick={onReload} className="pressable font-semibold text-accent">
            {s.retry}
          </button>
        </p>
      )}

      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <CardHeader title={h.urgent} aside={<span className="num text-[20px] font-semibold text-accent">{urgent.length}</span>}>
            {h.urgentLine(counts.overdue, counts.soon, soon)}
          </CardHeader>
          {urgent.length > 0 ? (
            <RowList className="pb-1">
              {urgent.map((e) => (
                <ItemRow key={`${e.course.id}-${e.id}`} entry={e} now={now} onOpen={onOpen} />
              ))}
            </RowList>
          ) : (
            <p className="px-5 pt-1 pb-4 text-[16px] leading-snug text-muted">{h.urgentEmpty(soon)}</p>
          )}
        </Card>

        <Card>
          <CardHeader title={h.weeks} aside={<span className="num text-[20px] font-semibold text-accent">{upcoming.length}</span>}>
            {h.weeksLine(upcoming.length)}
          </CardHeader>
          <DeadlineStrip days={days} selected={day} onSelect={setDay} />
          {shown.length > 0 ? (
            <RowList className="pb-1">
              {shown.map((e) => (
                <ItemRow key={`${e.course.id}-${e.id}`} entry={e} now={now} onOpen={onOpen} />
              ))}
            </RowList>
          ) : (
            <p className="px-5 pt-2 pb-4 text-[16px] leading-snug text-muted">{selectedDay ? h.dayEmpty : h.weeksEmpty}</p>
          )}
          {hiddenCount > 0 && (
            <div className="px-5 pt-1 pb-4">
              <button type="button" onClick={onGoDeadlines} className="pressable text-[15px] font-semibold text-accent">
                {h.more(hiddenCount)}
              </button>
            </div>
          )}
        </Card>

        {canCheck && (
        <Card>
          <CardHeader title={h.upload} aside={payload.queue.length > 0 ? <span className="num text-[20px] font-semibold text-accent">{payload.queue.length}</span> : undefined}>
            {check ? h.checkedAt(formatStamp(check.at, now)) : h.neverChecked}
          </CardHeader>
          <QueueList queue={payload.queue} queueAt={payload.queueAt} now={now} onCommand={onCommand} compact />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pb-5">
            {payload.queue.length > 0 ? (
              <button type="button" onClick={() => onCommand("check")} className="pressable text-[15px] font-semibold text-accent">
                {h.checkAgain}
              </button>
            ) : (
              <Button variant="secondary" onClick={() => onCommand("check")}>
                {s.commands.check}
              </Button>
            )}
            {check && (
              <button type="button" onClick={onGoCheck} className="pressable text-[15px] font-semibold text-accent">
                {h.report}
              </button>
            )}
          </div>
        </Card>
        )}
      </div>
    </div>
  );
}
