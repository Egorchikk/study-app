import type { Command } from "../lib/actions";
import { formatStamp, parseISO } from "../lib/dates";
import { t } from "../lib/i18n";
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
  const s = t().check;

  return (
    <div>
      <ScreenTitle title={t().tabs.check} subline={check ? <>{s.last} <span className="num">{formatStamp(check.at, now)}</span></> : s.never} />
      <div className="px-4 pb-4 lg:px-0">
        <Button className="w-full" onClick={() => onCommand("check")}>
          {t().commands.check}
        </Button>
        <p className="mt-2 px-1 text-[14px] leading-snug text-muted">{s.hint}</p>
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <CardHeader title={s.ready} aside={payload.queue.length > 0 ? <span className="num text-[20px] font-semibold text-accent">{payload.queue.length}</span> : undefined} />
          <QueueList queue={payload.queue} queueAt={payload.queueAt} now={now} onCommand={onCommand} />
        </Card>
        <Card>
          <CardHeader title={t().home.report}>{check ? formatStamp(check.at, now) : s.noReport}</CardHeader>
          <p className="report px-5 pt-2 pb-5 text-[15px] leading-[1.5]">{check ? check.text : s.reportHint}</p>
        </Card>
        <Card>
          <CardHeader title={s.upload}>{upload ? formatStamp(upload.at, now) : s.noUploads}</CardHeader>
          <p className="report px-5 pt-2 pb-5 text-[15px] leading-[1.5]">{upload ? upload.text : s.uploadHint}</p>
        </Card>
      </div>
    </div>
  );
}
