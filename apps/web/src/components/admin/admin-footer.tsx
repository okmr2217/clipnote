import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-3.5 md:px-8 md:py-4">
      <span className="text-xs font-medium text-muted-foreground">© Clipnote</span>
      <Link
        href="/"
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Clipnote.appについて
      </Link>
    </footer>
  );
}
