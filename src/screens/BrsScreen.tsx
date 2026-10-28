import { brsCourses, brsSummary, formatScore, isPassing, scoreRatio, shortPart } from "../lib/brs";
import { formatStamp } from "../lib/dates";
import { t } from "../lib/i18n";
import type { Course, Payload } from "../lib/types";
import { ScoreOf } from "../components/BrsCard";
import { Card } from "../components/Card";
import { Pill } from "../components/Pill";
import { ScreenTitle } from "../components/ScreenTitle";
import { ThinBar } from "../components/ThinBar";
import { Tile } from "../components/Tile";

interface Props {
  payload: Payload;
  now: Date;
  onOpenCourse(course: Course): void;
}

export function BrsScreen({ payload, now, onOpenCourse }: Props) {
  const list = brsCourses(payload);
  const shown = new Set(list.map((c) => c.id));
  const missing = payload.courses.filter((c) => !shown.has(c.id));
  const summary = brsSummary(payload);
  const s = t().brs;
  const of = t().of;

  return (
    <div>
      <ScreenTitle
        title={s.title}
        subline={
          <>
            {s.journal}: <span className="num">{formatStamp(payload.updated, now)}</span>
          </>
        }
      />
      <p className="px-5 pb-4 text-[16px] leading-snug lg:px-0">
        {summary.courses === 0 ? s.none : summary.passed > 0 ? s.passed(summary.passed, summary.courses) : s.some(summary.courses)}
      </p>
      {list.length > 0 && (
        <Card className="mx-4 lg:mx-0">
          <ul className="divide-y divide-rule">
            {list.map((c) => {
              const { total, parts, result } = c.brs;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => onOpenCourse(c)} className="pressable block w-full px-5 py-3.5 text-left">
                    <span className="flex items-center gap-3">
                      <Tile code={c.short} />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[16px] leading-snug font-medium">{c.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[14px] leading-snug text-muted">
                          {isPassing(result) ? <Pill tone="positive">{result}</Pill> : total ? total.name.toLowerCase() : s.byParts}
                        </span>
                      </span>
                      {total ? <ScoreOf score={total.score} max={total.max} size="lg" /> : <span className="num shrink-0 text-[14px] text-muted">—</span>}
                    </span>
                    {total && (
                      <span className="mt-2.5 block pl-[56px]">
                        <ThinBar ratio={scoreRatio(total)} label={`${c.name}: ${formatScore(total.score)} ${of} ${formatScore(total.max)}`} />
                      </span>
                    )}
                    {parts.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-[56px] text-[13px] leading-snug text-muted">
                        {parts.map((p) => (
                          <span key={p.name} className="num whitespace-nowrap">
                            {shortPart(p.name)} <span className={p.score === null ? "" : "font-semibold text-ink"}>{formatScore(p.score)}</span>/{formatScore(p.max)}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {missing.length > 0 && (
        <p className="px-5 pt-4 text-[14px] leading-snug text-muted lg:px-0">
          {s.missing(missing.map((c) => c.name).join(", "))}
        </p>
      )}
    </div>
  );
}
