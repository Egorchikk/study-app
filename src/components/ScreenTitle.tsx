import type { ReactNode } from "react";

export function ScreenTitle({ title, subline, aside }: { title: string; subline?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-3 pb-4 lg:px-0 lg:pt-8">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">{title}</h1>
        {subline && <p className="mt-1.5 text-[16px] leading-snug text-muted">{subline}</p>}
      </div>
      {aside && <div className="shrink-0 pt-1">{aside}</div>}
    </header>
  );
}
