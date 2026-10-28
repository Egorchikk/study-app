import type { ReactNode } from "react";

export function Card({ children, className = "", tinted = false }: { children: ReactNode; className?: string; tinted?: boolean }) {
  return <section className={`rounded-[20px] ${tinted ? "bg-tile" : "bg-surface"} ${className}`}>{children}</section>;
}

export function CardHeader({ title, aside, children }: { title: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
      <div className="min-w-0">
        <h2 className="text-[20px] leading-[1.2] font-semibold tracking-[-0.01em]">{title}</h2>
        {children && <p className="mt-0.5 text-[14px] leading-snug text-muted">{children}</p>}
      </div>
      {aside && <div className="shrink-0 pt-0.5">{aside}</div>}
    </div>
  );
}
