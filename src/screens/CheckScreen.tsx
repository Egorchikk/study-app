import type { Command } from "../lib/actions";
import { formatStamp, parseISO } from "../lib/dates";
import type { Payload, Report } from "../lib/types";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { QueueList } from "../components/QueueList";
import { ScreenTitle } from "../components/ScreenTitle";

interface Props {
  payload: Payload;
  now: Date;
  onCommand(command: Command): void;
}

function newer(a?: Report, b?: Report): Report | undefined {
  if (!a) return b;
  if (!b) return a;
  const ta = a.at ? parseISO(a.at).getTime() : 0;
  const tb = b.at ? parseISO(b.at).getTime() : 0;
  return tb > ta ? b : a;
}

export function CheckScreen({ payload, now, onCommand }: Props) {
  const check = payload.reports.check;
  const upload = newer(payload.reports.submit, payload.reports.draft);

  return (
    <div>
      <ScreenTitle title="Проверка" subline={check ? <>Последняя проверка: <span className="num">{formatStamp(check.at, now)}</span></> : "Проверка СДО и GitHub ещё не запускалась"} />
      <div className="px-4 pb-4 lg:px-0">
        <Button className="w-full" onClick={() => onCommand("check")}>
          Проверить и подгрузить
        </Button>
        <p className="mt-2 px-1 text-[14px] leading-snug text-muted">Сверит СДО с репозиториями на GitHub и соберёт очередь готовых работ. Займёт несколько минут, ответ придёт в чат.</p>
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <CardHeader title="Готово к загрузке" aside={payload.queue.length > 0 ? <span className="num text-[20px] font-semibold text-accent">{payload.queue.length}</span> : undefined} />
          <QueueList queue={payload.queue} queueAt={payload.queueAt} now={now} onCommand={onCommand} />
        </Card>
        <Card>
          <CardHeader title="Отчёт проверки">{check ? formatStamp(check.at, now) : "отчёта пока нет"}</CardHeader>
          <p className="report px-5 pt-2 pb-5 text-[15px] leading-[1.5]">{check ? check.text : "Нажми «Проверить и подгрузить», и здесь появится отчёт: что срочно, что готово к загрузке."}</p>
        </Card>
        <Card>
          <CardHeader title="Последняя загрузка">{upload ? formatStamp(upload.at, now) : "загрузок ещё не было"}</CardHeader>
          <p className="report px-5 pt-2 pb-5 text-[15px] leading-[1.5]">{upload ? upload.text : "После загрузки работ в СДО здесь будет отчёт по каждой из них."}</p>
        </Card>
      </div>
    </div>
  );
}
