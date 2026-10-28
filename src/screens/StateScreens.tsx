import { BOT_USERNAME } from "../lib/config";
import { t } from "../lib/i18n";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Mark } from "../components/Mark";
import { SkeletonRows } from "../components/Skeleton";

export function LoadingScreen() {
  return (
    <div aria-busy="true">
      <header className="px-5 pt-3 pb-4 lg:px-0 lg:pt-8">
        <h1 className="text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">{t().brand}</h1>
        <p className="skeleton mt-2 h-4 w-48" />
      </header>
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <div className="px-5 pt-4 pb-1">
            <p className="skeleton h-5 w-24" />
          </div>
          <SkeletonRows rows={3} />
        </Card>
        <Card>
          <div className="px-5 pt-4 pb-1">
            <p className="skeleton h-5 w-32" />
          </div>
          <SkeletonRows rows={4} />
        </Card>
      </div>
    </div>
  );
}

export function NoKeyScreen() {
  const s = t();
  return (
    <div className="px-5 pt-8 lg:px-0">
      <Mark size={44} />
      <h1 className="mt-5 text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">{s.brand}</h1>
      <p className="mt-3 text-[16px] leading-snug">{s.state.intro}</p>
      <p className="mt-2 text-[16px] leading-snug text-muted">{s.state.noKey(BOT_USERNAME)}</p>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: string | null; onRetry(): void }) {
  const wrongKey = error === "wrong key";
  const s = t();
  return (
    <div className="px-5 pt-8 lg:px-0">
      <Mark size={44} />
      <h1 className="mt-5 text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">{s.brand}</h1>
      <p className="mt-3 text-[16px] leading-snug">{wrongKey ? s.state.wrongKey : s.state.failed}</p>
      <p className="mt-2 text-[16px] leading-snug text-muted">{wrongKey ? s.state.wrongKeyHint(BOT_USERNAME) : s.state.failedHint}</p>
      <Button className="mt-5" onClick={onRetry}>
        {s.retry}
      </Button>
    </div>
  );
}
