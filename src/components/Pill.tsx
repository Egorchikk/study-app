import type { Tone } from "../lib/model";

export function Pill({ tone, children, className = "" }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={`pill pill-${tone} ${className}`}>{children}</span>;
}
