import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary font-semibold",
  secondary: "bg-tile text-tile-ink font-semibold",
  ghost: "text-accent font-semibold",
  quiet: "bg-raised text-ink font-medium",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[16px]",
  sm: "min-h-9 px-4 text-[14px]",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" {...props} className={`pressable inline-flex items-center justify-center gap-2 rounded-full disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} />;
}
