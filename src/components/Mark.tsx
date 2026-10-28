export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M16 10.5c-1.6-2.2-5.5-2.6-6.8.4-1.1 2.5.8 5 6.8 10.1 6-5.1 7.9-7.6 6.8-10.1-1.3-3-5.2-2.6-6.8-.4Z" fill="var(--on-primary)" />
    </svg>
  );
}
