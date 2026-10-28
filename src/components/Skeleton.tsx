export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <ul aria-hidden="true" className="divide-y divide-rule">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex min-h-[60px] items-center gap-3 px-5 py-2.5">
          <span className="skeleton h-11 w-11 rounded-[12px]" />
          <span className="flex-1">
            <span className="skeleton block h-4 w-3/4" />
            <span className="skeleton mt-2 block h-3.5 w-1/3" />
          </span>
          <span className="skeleton h-5 w-16 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
