import { ShieldCheckIcon } from "lucide-react";

export function LpMechanism() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 rounded-3xl border border-border bg-card px-8 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
          <ShieldCheckIcon className="size-5.5 text-primary" />
        </div>
        <p className="text-[17px] leading-[1.8] font-bold text-foreground">
          貼り付けたものは、崩れることなく、
          <br className="hidden md:block" />
          そのまま安全に表示されます。
        </p>
      </div>
    </section>
  );
}
