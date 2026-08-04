import Link from "next/link";

export function LpFinalCta() {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-16 text-center md:px-8 md:py-24">
      <Link
        href="/signup"
        className="inline-block rounded-2xl bg-primary px-11 py-5 text-[17px] font-bold text-primary-foreground shadow-[var(--shadow-accent)]"
      >
        今すぐ無料で始める
      </Link>
    </section>
  );
}
