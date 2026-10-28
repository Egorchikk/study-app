export function Tile({ code, size = 44 }: { code: string; size?: number }) {
  const label = code.split(" ")[0];
  const font = label.length > 5 ? 11 : label.length > 3 ? 12 : 14;
  return (
    <span className="flex shrink-0 items-center justify-center rounded-[12px] bg-tile font-bold text-accent" style={{ width: size, height: size, fontSize: font, letterSpacing: label.length > 4 ? "-0.01em" : 0 }} aria-hidden="true">
      {label}
    </span>
  );
}
