export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[400px] rounded-[22px] border border-border bg-card px-8 py-9 shadow-[var(--shadow-card)]">
        <div className="mb-7 text-center text-xl font-extrabold tracking-tight">
          Clip<span className="text-primary">note</span>
        </div>
        {children}
      </div>
    </main>
  );
}
