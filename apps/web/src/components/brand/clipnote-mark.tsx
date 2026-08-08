export function ClipnoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <clipPath id="clipnote-mark-note">
          <rect x="14" y="14" width="36" height="42" rx="4" />
        </clipPath>
      </defs>
      <g clipPath="url(#clipnote-mark-note)">
        <rect x="14" y="14" width="36" height="42" fill="var(--foreground)" />
        <rect x="14" y="14" width="4" height="42" fill="var(--primary)" />
      </g>
      <rect x="24" y="30" width="18" height="2.4" rx="1.2" fill="var(--accent)" />
      <rect x="24" y="36" width="13" height="2.4" rx="1.2" fill="var(--accent)" />
      <rect x="24" y="42" width="15" height="2.4" rx="1.2" fill="var(--accent)" />
      <rect x="41" y="10" width="10" height="18" rx="5" fill="var(--primary)" />
      <circle cx="46" cy="15" r="1.7" fill="var(--foreground)" />
    </svg>
  );
}
