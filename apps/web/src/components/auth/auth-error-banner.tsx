export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-5 rounded-md border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] px-3.5 py-3 text-[13px] font-semibold text-[var(--auth-error-foreground)]"
    >
      {message}
    </div>
  );
}
